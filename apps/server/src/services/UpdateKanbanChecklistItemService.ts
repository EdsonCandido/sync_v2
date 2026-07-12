import type { UpdateKanbanChecklistItemInput } from "@sync_v2/contracts";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanChecklistRepository } from "../repositories/KanbanChecklistRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class UpdateKanbanChecklistItemService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly checklistRepository = new KanbanChecklistRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		itemId: string,
		input: UpdateKanbanChecklistItemInput,
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

		const updated = await this.checklistRepository.update(itemId, cardId, {
			title: input.title?.trim(),
			done: input.done,
		});

		if (!updated) {
			throw new AppError(404, "Item de checklist não encontrado.");
		}

		let message = "Checklist atualizado.";
		if (input.done === true) {
			message = `Item concluído: "${updated.title}".`;
		} else if (input.done === false) {
			message = `Item reaberto: "${updated.title}".`;
		} else if (input.title) {
			message = `Item renomeado para "${updated.title}".`;
		}

		await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "checklist",
			message,
		});

		return updated;
	}
}
