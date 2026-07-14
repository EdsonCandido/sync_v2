import type { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { AppError } from "../utils/AppError";

export async function assertCanAccessKanbanBoard(
	boardRepository: KanbanBoardRepository,
	params: {
		boardId: string;
		companyId: string;
		userId: string;
		perfil: string;
	},
) {
	const board = await boardRepository.findById(
		params.boardId,
		params.companyId,
	);
	if (!board) {
		throw new AppError(404, "Kanban não encontrado.");
	}

	if (params.perfil === "admin_empresa") {
		return board;
	}

	if (board.isDefault) {
		return board;
	}

	if (board.createdBy === params.userId) {
		return board;
	}

	const isMember = await boardRepository.isMember(
		params.boardId,
		params.userId,
	);
	if (!isMember) {
		throw new AppError(403, "Sem permissão para este kanban.");
	}

	return board;
}

export function canManageKanbanBoard(params: {
	board: { isDefault: boolean; createdBy: string | null };
	userId: string;
	perfil: string;
}) {
	if (params.perfil === "admin_empresa") {
		return true;
	}
	if (params.board.isDefault) {
		return false;
	}
	return params.board.createdBy === params.userId;
}

export function assertCanManageKanbanBoard(params: {
	board: { isDefault: boolean; createdBy: string | null };
	userId: string;
	perfil: string;
}) {
	if (!canManageKanbanBoard(params)) {
		throw new AppError(403, "Sem permissão para gerenciar este kanban.");
	}
}
