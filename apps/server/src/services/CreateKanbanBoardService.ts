import type { CreateKanbanBoardInput } from "@sync_v2/contracts";
import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { AppError } from "../utils/AppError";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";
import { EnsureDefaultKanbanBoardService } from "./EnsureDefaultKanbanBoardService";

export class CreateKanbanBoardService {
	constructor(
		private readonly boardRepository = new KanbanBoardRepository(),
		private readonly ensureDefault = new EnsureDefaultKanbanBoardService(),
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
	) {}

	async execute(
		input: CreateKanbanBoardInput,
		params: { companyId: string; userId: string; perfil: string },
	) {
		if (params.perfil !== "admin_empresa") {
			throw new AppError(403, "Apenas admin pode criar kanbans.");
		}

		await this.ensureDefault.execute(params.companyId, params.userId);

		const name = input.name.trim();
		if (!name) {
			throw new AppError(400, "Nome do kanban obrigatório.");
		}

		const board = await this.boardRepository.create({
			companyId: params.companyId,
			name,
			isDefault: false,
			priority: input.priority ?? 0,
			createdBy: params.userId,
		});

		const memberIds = [...new Set(input.memberUserIds ?? [])];
		if (!memberIds.includes(params.userId)) {
			memberIds.push(params.userId);
		}
		await this.boardRepository.syncMembers(board.id, memberIds);
		await this.ensureBase.execute(params.companyId, board.id);

		const memberUserIds = await this.boardRepository.listMemberUserIds(
			board.id,
		);
		return {
			id: board.id,
			name: board.name,
			isDefault: board.isDefault,
			priority: board.priority,
			createdBy: board.createdBy,
			canManage: true,
			memberUserIds,
		};
	}
}
