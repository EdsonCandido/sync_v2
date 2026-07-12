import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 20;
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

function sanitizeFileName(name: string) {
	return name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180) || "arquivo";
}

export class UploadFinancialEntryAttachmentService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		entryId: string,
		file: {
			originalname: string;
			mimetype: string;
			size: number;
			buffer: Buffer;
		},
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(
			entryId,
			params.companyId,
		);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		if (!file?.buffer?.length) throw new AppError(400, "Arquivo obrigatório.");
		if (file.size > MAX_FILE_BYTES) {
			throw new AppError(400, "Arquivo excede o limite de 10 MB.");
		}
		const mimeType = file.mimetype || "application/octet-stream";
		if (!ALLOWED_MIME_TYPES.has(mimeType)) {
			throw new AppError(400, "Tipo de arquivo não permitido.");
		}
		const existing = await this.entryRepository.listAttachmentsMeta(entryId);
		if (existing.length >= MAX_ATTACHMENTS) {
			throw new AppError(400, `Limite de ${MAX_ATTACHMENTS} anexos.`);
		}
		const row = await this.entryRepository.createAttachment({
			entryId,
			originalName: sanitizeFileName(file.originalname),
			mimeType,
			sizeBytes: file.size,
			content: file.buffer,
			uploadedBy: params.userId,
		});
		if (!row) throw new AppError(500, "Falha ao salvar anexo.");
		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId,
			action: "attachment",
			userId: params.userId,
			ip: params.ip,
			payload: { attachmentId: row.id, name: row.originalName },
		});
		return row;
	}
}

export class DownloadFinancialEntryAttachmentService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(entryId: string, attachmentId: string, companyId: string) {
		const entry = await this.entryRepository.findById(entryId, companyId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		const attachment = await this.entryRepository.findAttachment(
			attachmentId,
			entryId,
		);
		if (!attachment) throw new AppError(404, "Anexo não encontrado.");
		return attachment;
	}
}

export class SoftDeleteFinancialEntryAttachmentService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		entryId: string,
		attachmentId: string,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(
			entryId,
			params.companyId,
		);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		const deleted = await this.entryRepository.softDeleteAttachment(
			attachmentId,
			entryId,
		);
		if (!deleted) throw new AppError(404, "Anexo não encontrado.");
		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId,
			action: "attachment",
			userId: params.userId,
			ip: params.ip,
			payload: { deleted: true, attachmentId },
		});
		return deleted;
	}
}
