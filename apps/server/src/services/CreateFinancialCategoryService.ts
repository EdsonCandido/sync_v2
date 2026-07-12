import type { CreateFinancialCategoryInput } from "@sync_v2/contracts";
import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import { AppError } from "../utils/AppError";

export class CreateFinancialCategoryService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
	) {}

	async execute(
		input: CreateFinancialCategoryInput,
		params: { companyId: string; userId: string },
	) {
		const byName = await this.financialCategoryRepository.findByName(
			params.companyId,
			input.name,
		);
		if (byName) {
			throw new AppError(
				409,
				"Categoria financeira já cadastrada nesta empresa.",
			);
		}

		return this.financialCategoryRepository.create({
			...input,
			companyId: params.companyId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
	}
}
