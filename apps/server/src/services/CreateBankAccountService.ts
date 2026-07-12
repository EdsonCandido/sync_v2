import type { CreateBankAccountInput } from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";

export class CreateBankAccountService {
	constructor(
		private readonly bankAccountRepository = new BankAccountRepository(),
	) {}

	async execute(
		input: CreateBankAccountInput,
		params: { companyId: string; userId: string },
	) {
		return this.bankAccountRepository.create({
			...input,
			companyId: params.companyId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
	}
}
