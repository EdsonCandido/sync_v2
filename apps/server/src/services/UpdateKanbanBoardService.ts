import type { UpdateKanbanBoardInput } from "@sync_v2/contracts";
import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { AppError } from "../utils/AppError";
import {
	assertCanManageKanbanBoard,
	canManageKanbanBoard,
} from "./KanbanBoardAccessRules";

export class UpdateKanbanBoardService {
	constructor(private readonly boardRepository = new KanbanBoardRepository()) {}

	async execute(
		boardId: string,
		input: UpdateKanbanBoardInput,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const board = await this.boardRepository.findById(
			boardId,
			params.companyId,
		);
		if (!board) {
			throw new AppError(404, "Kanban não encontrado.");
		}

		assertCanManageKanbanBoard({
			board,
			userId: params.userId,
			perfil: params.perfil,
		});

		const patch: { name?: string; priority?: number } = {};
		if (input.name !== undefined) {
			const name = input.name.trim();
			if (!name) {
				throw new AppError(400, "Nome do kanban obrigatório.");
			}
			patch.name = name;
		}
		if (input.priority !== undefined) {
			patch.priority = input.priority;
		}

		const updated =
			Object.keys(patch).length > 0
				? await this.boardRepository.update(boardId, params.companyId, patch)
				: board;

		if (!updated) {
			throw new AppError(500, "Falha ao atualizar kanban.");
		}

		let memberUserIds = await this.boardRepository.listMemberUserIds(boardId);
		if (input.memberUserIds !== undefined) {
			if (updated.isDefault) {
				throw new AppError(400, "Kanban default não usa lista de membros.");
			}
			const memberIds = [...new Set(input.memberUserIds)];
			if (updated.createdBy && !memberIds.includes(updated.createdBy)) {
				memberIds.push(updated.createdBy);
			}
			memberUserIds = await this.boardRepository.syncMembers(
				boardId,
				memberIds,
			);
		}

		return {
			id: updated.id,
			name: updated.name,
			isDefault: updated.isDefault,
			priority: updated.priority,
			createdBy: updated.createdBy,
			canManage: canManageKanbanBoard({
				board: updated,
				userId: params.userId,
				perfil: params.perfil,
			}),
			memberUserIds: updated.isDefault ? [] : memberUserIds,
		};
	}
}
