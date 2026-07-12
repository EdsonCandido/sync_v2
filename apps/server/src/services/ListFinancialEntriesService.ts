import type { ListFinancialEntriesQuery } from "@sync_v2/contracts";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";

export class ListFinancialEntriesService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(query: ListFinancialEntriesQuery, companyId: string) {
		return this.entryRepository.list({ companyId, ...query });
	}
}
