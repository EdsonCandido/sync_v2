import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(id: string, companyId: string, userId: string) {
		const entry = await this.entryRepository.softDelete(id, companyId, userId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		return entry;
	}
}
