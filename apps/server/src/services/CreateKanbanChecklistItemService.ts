import type { CreateKanbanChecklistItemInput } from "@sync_v2/contracts";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanChecklistRepository } from "../repositories/KanbanChecklistRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class CreateKanbanChecklistItemService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly checklistRepository = new KanbanChecklistRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		input: CreateKanbanChecklistItemInput,
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

		const title = input.title.trim();
		const position = await this.checklistRepository.nextPosition(cardId);
		const item = await this.checklistRepository.create({
			cardId,
			title,
			position,
		});

		await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "checklist",
			message: `Item de checklist adicionado: "${title}".`,
		});

		return item;
	}
}
