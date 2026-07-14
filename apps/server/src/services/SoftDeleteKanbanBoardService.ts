import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteKanbanBoardService {
	constructor(
		private readonly boardRepository = new KanbanBoardRepository(),
	) {}

	async execute(
		boardId: string,
		params: { companyId: string; userId: string; perfil: string },
	) {
		if (params.perfil !== "admin_empresa") {
			throw new AppError(403, "Apenas admin pode excluir kanbans.");
		}

		const board = await this.boardRepository.findById(boardId, params.companyId);
		if (!board) {
			throw new AppError(404, "Kanban não encontrado.");
		}
		if (board.isDefault) {
			throw new AppError(400, "Kanban default não pode ser excluído.");
		}

		const deleted = await this.boardRepository.softDelete(
			boardId,
			params.companyId,
		);
		if (!deleted) {
			throw new AppError(400, "Não foi possível excluir o kanban.");
		}

		await this.boardRepository.softDeleteAllMembers(boardId);
		return deleted;
	}
}
