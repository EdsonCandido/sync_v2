import type { ListCompaniesQuery } from "@sync_v2/contracts";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { withRemainingDays } from "../utils/planRemainingDays";

export class ListCompaniesService {
	constructor(private readonly companyRepository = new CompanyRepository()) {}

	async execute(query: ListCompaniesQuery) {
		const result = await this.companyRepository.list(query);
		const now = new Date();
		return {
			...result,
			items: result.items.map((company) => withRemainingDays(company, now)),
		};
	}
}
