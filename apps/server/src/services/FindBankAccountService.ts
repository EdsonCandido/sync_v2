import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { AppError } from "../utils/AppError";

export class FindBankAccountService {
	constructor(
		private readonly bankAccountRepository = new BankAccountRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const account = await this.bankAccountRepository.findById(id, companyId);
		if (!account) {
			throw new AppError(404, "Conta bancária não encontrada.");
		}
		return account;
	}
}
