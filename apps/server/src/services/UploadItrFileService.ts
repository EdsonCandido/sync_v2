import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";
import type { ItrUploadFile } from "./CreateItrProcessService";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 20;

const ALLOWED_MIME_TYPES = new Set([
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"text/plain",
	"text/csv",
	"application/csv",
	"application/zip",
	"application/x-zip-compressed",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export class UploadItrFileService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(
		processId: string,
		file: ItrUploadFile,
		params: { companyId: string; userId: string },
	) {
		const process = await this.processRepository.findById(
			processId,
			params.companyId,
		);
		if (!process) {
			throw new AppError(404, "Processo ITR não encontrado.");
		}

		if (!file?.buffer?.length) {
			throw new AppError(400, "Arquivo obrigatório.");
		}
		if (file.size > MAX_FILE_BYTES) {
			throw new AppError(400, "Arquivo excede o limite de 10 MB.");
		}
		const mimeType = file.mimetype || "application/octet-stream";
		if (!ALLOWED_MIME_TYPES.has(mimeType)) {
			throw new AppError(400, "Tipo de arquivo não permitido.");
		}

		const activeCount =
			await this.fileRepository.countActiveByProcess(processId);
		if (activeCount >= MAX_FILES) {
			throw new AppError(400, `Limite de ${MAX_FILES} arquivos por processo.`);
		}

		const originalName = sanitizeFileName(file.originalname);
		const row = await this.fileRepository.create({
			processId,
			kind: "anexo",
			originalName,
			mimeType,
			sizeBytes: file.size,
			content: file.buffer,
			uploadedBy: params.userId,
		});
		if (!row) {
			throw new AppError(500, "Falha ao salvar arquivo.");
		}
		return row;
	}
}

function sanitizeFileName(name: string) {
	const trimmed = name.trim().replace(/[/\\]/g, "_");
	if (!trimmed) return "arquivo";
	return trimmed.slice(0, 255);
}
