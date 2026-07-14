import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";

export class EnsureBaseKanbanColumnsService {
	constructor(
		private readonly columnRepository = new KanbanColumnRepository(),
	) {}

	async execute(companyId: string, boardId: string) {
		const baseCount = await this.columnRepository.countBase(boardId);
		if (baseCount >= 4) {
			return this.columnRepository.listByBoard(companyId, boardId);
		}
		await this.columnRepository.insertBaseColumns(companyId, boardId);
		return this.columnRepository.listByBoard(companyId, boardId);
	}
}
