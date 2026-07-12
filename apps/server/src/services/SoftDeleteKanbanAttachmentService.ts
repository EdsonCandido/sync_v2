import { KanbanAttachmentRepository } from "../repositories/KanbanAttachmentRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class SoftDeleteKanbanAttachmentService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly attachmentRepository = new KanbanAttachmentRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		attachmentId: string,
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

		const existing = await this.attachmentRepository.findMetadataById(
			attachmentId,
			cardId,
		);
		if (!existing) {
			throw new AppError(404, "Anexo não encontrado.");
		}

		const deleted = await this.attachmentRepository.softDelete(
			attachmentId,
			cardId,
		);
		if (!deleted) {
			throw new AppError(404, "Anexo não encontrado.");
		}

		await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "attachment",
			message: `Anexo removido: "${existing.originalName}".`,
		});

		return {
			id: deleted.id,
			originalName: deleted.originalName,
			mimeType: deleted.mimeType,
			sizeBytes: deleted.sizeBytes,
			uploadedBy: deleted.uploadedBy,
			createdAt: deleted.createdAt,
		};
	}
}
