import type { ListBankAccountsQuery } from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { AppError } from "../utils/AppError";

export class ListBankAccountsService {
	constructor(
		private readonly bankAccountRepository = new BankAccountRepository(),
	) {}

	async execute(query: ListBankAccountsQuery, companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return this.bankAccountRepository.list({
			companyId,
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});
	}
}
