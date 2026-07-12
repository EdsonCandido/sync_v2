import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteBankAccountService {
	constructor(
		private readonly bankAccountRepository = new BankAccountRepository(),
	) {}

	async execute(id: string, companyId: string, userId: string) {
		const deleted = await this.bankAccountRepository.softDelete(
			id,
			companyId,
			userId,
		);
		if (!deleted) {
			throw new AppError(404, "Conta bancária não encontrada.");
		}
		return deleted;
	}
}
