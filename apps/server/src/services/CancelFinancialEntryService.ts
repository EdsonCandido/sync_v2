import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class CancelFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		id: string,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(id, params.companyId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		if (entry.status === "cancelado") {
			throw new AppError(400, "Lançamento já cancelado.");
		}
		if (entry.valorPago > 0) {
			throw new AppError(
				400,
				"Estorne as baixas antes de cancelar o lançamento.",
			);
		}
		const cancelled = await this.entryRepository.cancel(
			id,
			params.companyId,
			params.userId,
		);
		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId: id,
			action: "cancelled",
			userId: params.userId,
			ip: params.ip,
		});
		return cancelled;
	}
}
