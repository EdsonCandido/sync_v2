import { KanbanAttachmentRepository } from "../repositories/KanbanAttachmentRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_CARD = 20;

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
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export class UploadKanbanAttachmentService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly attachmentRepository = new KanbanAttachmentRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		file: {
			originalname: string;
			mimetype: string;
			size: number;
			buffer: Buffer;
		},
		params: { companyId: string; userId: string; perfil: string },
	) {
		const card = await this.cardRepository.findById(cardId, params.companyId);
		if (!card) {
			throw new AppError(404, "Card não encontrado.");
		}

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId,
			userId: params.userId,
			perfil: params.perfil,
		});

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
			await this.attachmentRepository.countActiveByCard(cardId);
		if (activeCount >= MAX_ATTACHMENTS_PER_CARD) {
			throw new AppError(
				400,
				`Limite de ${MAX_ATTACHMENTS_PER_CARD} anexos por card.`,
			);
		}

		const originalName = sanitizeFileName(file.originalname);
		const row = await this.attachmentRepository.create({
			cardId,
			originalName,
			mimeType,
			sizeBytes: file.size,
			content: file.buffer,
			uploadedBy: params.userId,
		});
		if (!row) {
			throw new AppError(500, "Falha ao salvar anexo.");
		}

		await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "attachment",
			message: `Anexo adicionado: "${originalName}".`,
		});

		return {
			id: row.id,
			originalName: row.originalName,
			mimeType: row.mimeType,
			sizeBytes: row.sizeBytes,
			uploadedBy: row.uploadedBy,
			createdAt: row.createdAt,
		};
	}
}

function sanitizeFileName(name: string) {
	const trimmed = name.trim().replace(/[/\\]/g, "_");
	if (!trimmed) return "arquivo";
	return trimmed.slice(0, 255);
}
