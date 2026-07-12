import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class SoftDeleteKanbanCardService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		id: string,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const card = await this.cardRepository.findById(id, params.companyId);
		if (!card) {
			throw new AppError(404, "Card não encontrado.");
		}

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId: id,
			userId: params.userId,
			perfil: params.perfil,
		});

		const deleted = await this.cardRepository.softDelete(
			id,
			params.companyId,
			params.userId,
		);
		if (!deleted) {
			throw new AppError(404, "Card não encontrado.");
		}

		await this.historyRepository.create({
			cardId: id,
			userId: params.userId,
			eventType: "updated",
			message: "Card excluído.",
		});

		return deleted;
	}
}
