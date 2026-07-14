import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanBoard } from "./KanbanBoardAccessRules";

export class SoftDeleteKanbanColumnService {
	constructor(
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly boardRepository = new KanbanBoardRepository(),
	) {}

	async execute(
		id: string,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const column = await this.columnRepository.findById(id, params.companyId);
		if (!column) {
			throw new AppError(404, "Coluna não encontrada.");
		}
		if (column.isBase) {
			throw new AppError(400, "Colunas base não podem ser excluídas.");
		}
		if (!column.boardId) {
			throw new AppError(400, "Coluna sem kanban vinculado.");
		}

		await assertCanAccessKanbanBoard(this.boardRepository, {
			boardId: column.boardId,
			companyId: params.companyId,
			userId: params.userId,
			perfil: params.perfil,
		});

		const deleted = await this.columnRepository.softDelete(
			id,
			params.companyId,
		);
		if (!deleted) {
			throw new AppError(400, "Não foi possível excluir a coluna.");
		}
		return deleted;
	}
}
