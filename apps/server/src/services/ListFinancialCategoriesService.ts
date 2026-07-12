import type { ListFinancialCategoriesQuery } from "@sync_v2/contracts";
import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import { AppError } from "../utils/AppError";

export class ListFinancialCategoriesService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
	) {}

	async execute(query: ListFinancialCategoriesQuery, companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return this.financialCategoryRepository.list({
			companyId,
			q: query.q,
			tipo: query.tipo,
			page: query.page,
			pageSize: query.pageSize,
		});
	}
}
