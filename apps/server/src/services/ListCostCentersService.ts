import type { ListCostCentersQuery } from "@sync_v2/contracts";
import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { AppError } from "../utils/AppError";

export class ListCostCentersService {
	constructor(
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(query: ListCostCentersQuery, companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return this.costCenterRepository.list({
			companyId,
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});
	}
}
