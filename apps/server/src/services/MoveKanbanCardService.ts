import type { MoveKanbanCardInput } from "@sync_v2/contracts";
import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanBoard } from "./KanbanBoardAccessRules";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class MoveKanbanCardService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly boardRepository = new KanbanBoardRepository(),
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

		const sourceColumn = await this.columnRepository.findById(
			card.columnId,
			params.companyId,
		);
		if (!sourceColumn?.boardId) {
			throw new AppError(404, "Coluna não encontrada.");
		}

		await assertCanAccessKanbanBoard(this.boardRepository, {
			boardId: sourceColumn.boardId,
			companyId: params.companyId,
			userId: params.userId,
			perfil: params.perfil,
		});

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId: id,
			userId: params.userId,
			perfil: params.perfil,
		});

		const column = await this.columnRepository.findById(
			input.columnId,
			params.companyId,
		);
		if (!column?.boardId) {
			throw new AppError(404, "Coluna não encontrada.");
		}
		if (column.boardId !== sourceColumn.boardId) {
			throw new AppError(400, "Não é possível mover card entre kanbans.");
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
