import type {
	ListLoginAccessHistoryQuery,
	LoginAccessHistoryItem,
} from "@sync_v2/contracts";
import { LoginAccessLogRepository } from "../repositories/LoginAccessLogRepository";

export class ListLoginAccessHistoryService {
	constructor(
		private readonly loginAccessLogRepository = new LoginAccessLogRepository(),
	) {}

	async execute(query: ListLoginAccessHistoryQuery) {
		const result = await this.loginAccessLogRepository.listHistory({
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});

		return {
			items: result.items.map((row) => ({
				...row,
				perfil: row.perfil as LoginAccessHistoryItem["perfil"],
			})),
			total: result.total,
			page: result.page,
			pageSize: result.pageSize,
		};
	}
}
