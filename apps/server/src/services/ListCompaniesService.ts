import type { ListCompaniesQuery } from "@sync_v2/contracts";
import { CompanyRepository } from "../repositories/CompanyRepository";

export class ListCompaniesService {
	constructor(private readonly companyRepository = new CompanyRepository()) {}

	async execute(query: ListCompaniesQuery) {
		return this.companyRepository.list(query);
	}
}
