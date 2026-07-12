import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";

export class EnsureBaseKanbanColumnsService {
	constructor(
		private readonly columnRepository = new KanbanColumnRepository(),
	) {}

	async execute(companyId: string) {
		const baseCount = await this.columnRepository.countBase(companyId);
		if (baseCount >= 4) {
			return this.columnRepository.listByCompany(companyId);
		}
		await this.columnRepository.insertBaseColumns(companyId);
		return this.columnRepository.listByCompany(companyId);
	}
}
