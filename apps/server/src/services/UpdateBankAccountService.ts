import type { UpdateBankAccountInput } from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { AppError } from "../utils/AppError";

export class UpdateBankAccountService {
	constructor(
		private readonly bankAccountRepository = new BankAccountRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateBankAccountInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.bankAccountRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Conta bancária não encontrada.");
		}

		const payload: UpdateBankAccountInput & {
			saldoAtual?: number;
			updatedBy?: string | null;
		} = {
			...input,
			updatedBy: params.userId,
		};

		if (
			input.saldoInicial !== undefined &&
			input.saldoInicial !== existing.saldoInicial
		) {
			const delta = input.saldoInicial - existing.saldoInicial;
			payload.saldoAtual = existing.saldoAtual + delta;
		}

		const updated = await this.bankAccountRepository.update(
			id,
			params.companyId,
			payload,
		);
		if (!updated) {
			throw new AppError(404, "Conta bancária não encontrada.");
		}
		return updated;
	}
}
