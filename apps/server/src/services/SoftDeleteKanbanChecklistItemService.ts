import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanChecklistRepository } from "../repositories/KanbanChecklistRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class SoftDeleteKanbanChecklistItemService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly checklistRepository = new KanbanChecklistRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		itemId: string,
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

		const existing = await this.checklistRepository.findById(itemId, cardId);
		if (!existing) {
			throw new AppError(404, "Item de checklist não encontrado.");
		}

		const deleted = await this.checklistRepository.softDelete(itemId, cardId);
		if (!deleted) {
			throw new AppError(404, "Item de checklist não encontrado.");
		}

		await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "checklist",
			message: `Item removido: "${existing.title}".`,
		});

		return deleted;
	}
}
