import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { AppError } from "../utils/AppError";
import { EnsureDefaultKanbanBoardService } from "./EnsureDefaultKanbanBoardService";
import { canManageKanbanBoard } from "./KanbanBoardAccessRules";

export class ListKanbanBoardsService {
	constructor(
		private readonly boardRepository = new KanbanBoardRepository(),
		private readonly ensureDefault = new EnsureDefaultKanbanBoardService(),
	) {}

	async execute(params: { companyId: string; userId: string; perfil: string }) {
		if (params.perfil !== "admin_empresa" && params.perfil !== "cliente") {
			throw new AppError(403, "Sem permissão para o Kanban.");
		}

		await this.ensureDefault.execute(params.companyId, params.userId);
		const boards = await this.boardRepository.listByCompany(params.companyId);
		const members = await this.boardRepository.listMembersByBoardIds(
			boards.map((b) => b.id),
		);
		const membersByBoard = new Map<string, string[]>();
		for (const m of members) {
			const list = membersByBoard.get(m.boardId) ?? [];
			list.push(m.userId);
			membersByBoard.set(m.boardId, list);
		}

		const accessible = boards.filter((board) => {
			if (params.perfil === "admin_empresa") return true;
			if (board.isDefault) return true;
			if (board.createdBy === params.userId) return true;
			return (membersByBoard.get(board.id) ?? []).includes(params.userId);
		});

		return {
			boards: accessible.map((board) => ({
				id: board.id,
				name: board.name,
				isDefault: board.isDefault,
				priority: board.priority,
				createdBy: board.createdBy,
				canManage: canManageKanbanBoard({
					board,
					userId: params.userId,
					perfil: params.perfil,
				}),
				memberUserIds: board.isDefault
					? []
					: (membersByBoard.get(board.id) ?? []),
			})),
		};
	}
}
