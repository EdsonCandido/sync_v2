import type { SoftDeleteFinancialEntryInput } from "@sync_v2/contracts";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		id: string,
		companyId: string,
		userId: string,
		input: SoftDeleteFinancialEntryInput = { deleteOpenInstallments: false },
	) {
		const entry = await this.entryRepository.softDelete(id, companyId, userId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");

		if (input.deleteOpenInstallments && entry.installmentGroupId) {
			const openSiblings = await this.entryRepository.listOpenByGroup(
				companyId,
				entry.installmentGroupId,
			);
			for (const sibling of openSiblings) {
				if (sibling.id === id) continue;
				await this.entryRepository.softDelete(sibling.id, companyId, userId);
			}
		}

		return entry;
	}
}
