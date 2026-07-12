import type { UpdateFinancialCategoryInput } from "@sync_v2/contracts";
import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import { AppError } from "../utils/AppError";

export class UpdateFinancialCategoryService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateFinancialCategoryInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.financialCategoryRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Categoria financeira não encontrada.");
		}

		if (input.name !== undefined && input.name !== existing.name) {
			const byName = await this.financialCategoryRepository.findByName(
				params.companyId,
				input.name,
				id,
			);
			if (byName) {
				throw new AppError(
					409,
					"Categoria financeira já cadastrada nesta empresa.",
				);
			}
		}

		const updated = await this.financialCategoryRepository.update(
			id,
			params.companyId,
			{ ...input, updatedBy: params.userId },
		);
		if (!updated) {
			throw new AppError(404, "Categoria financeira não encontrada.");
		}
		return updated;
	}
}
