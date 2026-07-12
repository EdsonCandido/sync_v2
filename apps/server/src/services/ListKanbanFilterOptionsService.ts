import { KanbanFilterOptionsRepository } from "../repositories/KanbanFilterOptionsRepository";

export class ListKanbanFilterOptionsService {
	constructor(
		private readonly filterOptionsRepository = new KanbanFilterOptionsRepository(),
	) {}

	async execute(companyId: string) {
		const [assignees, clientRows, tags] = await Promise.all([
			this.filterOptionsRepository.listAssignees(companyId),
			this.filterOptionsRepository.listClients(companyId),
			this.filterOptionsRepository.listTags(companyId),
		]);

		return { assignees, clients: clientRows, tags };
	}
}
