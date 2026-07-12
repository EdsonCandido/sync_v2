import type { AddKanbanObservationInput } from "@sync_v2/contracts";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class AddKanbanCardObservationService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		cardId: string,
		input: AddKanbanObservationInput,
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

		const message = input.message.trim();
		const entry = await this.historyRepository.create({
			cardId,
			userId: params.userId,
			eventType: "observation",
			message,
		});

		return entry;
	}
}
