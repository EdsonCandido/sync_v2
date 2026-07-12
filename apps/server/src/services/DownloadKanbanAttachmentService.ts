import { KanbanAttachmentRepository } from "../repositories/KanbanAttachmentRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class DownloadKanbanAttachmentService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly attachmentRepository = new KanbanAttachmentRepository(),
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

		const row = await this.attachmentRepository.findById(attachmentId, cardId);
		if (!row) {
			throw new AppError(404, "Anexo não encontrado.");
		}

		return {
			originalName: row.originalName,
			mimeType: row.mimeType,
			sizeBytes: row.sizeBytes,
			content: row.content,
		};
	}
}
