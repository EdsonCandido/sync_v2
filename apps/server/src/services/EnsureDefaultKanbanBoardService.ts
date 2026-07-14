import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";

export class EnsureDefaultKanbanBoardService {
	constructor(
		private readonly boardRepository = new KanbanBoardRepository(),
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
	) {}

	async execute(companyId: string, createdBy?: string | null) {
		let board = await this.boardRepository.findDefault(companyId);
		if (!board) {
			board = await this.boardRepository.create({
				companyId,
				name: "Kanban",
				isDefault: true,
				priority: 0,
				createdBy: createdBy ?? null,
			});
		}

		await this.boardRepository.backfillColumnsWithoutBoard(companyId, board.id);
		await this.ensureBase.execute(companyId, board.id);
		return board;
	}
}
