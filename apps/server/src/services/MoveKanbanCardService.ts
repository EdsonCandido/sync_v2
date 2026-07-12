import type { MoveKanbanCardInput } from "@sync_v2/contracts";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class MoveKanbanCardService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async execute(
		id: string,
		input: MoveKanbanCardInput,
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

		const column = await this.columnRepository.findById(
			input.columnId,
			params.companyId,
		);
		if (!column) {
			throw new AppError(404, "Coluna não encontrada.");
		}

		const moved = await this.cardRepository.move(id, params.companyId, {
			columnId: input.columnId,
			position: input.position,
			updatedBy: params.userId,
		});

		if (!moved) {
			throw new AppError(404, "Card não encontrado.");
		}

		if (card.columnId !== input.columnId) {
			await this.historyRepository.create({
				cardId: id,
				userId: params.userId,
				eventType: "moved",
				message: `Movido para "${column.name}".`,
			});
		}

		return moved;
	}
}
