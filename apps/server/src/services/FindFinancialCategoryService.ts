import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import { AppError } from "../utils/AppError";

export class FindFinancialCategoryService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const category = await this.financialCategoryRepository.findById(
			id,
			companyId,
		);
		if (!category) {
			throw new AppError(404, "Categoria financeira não encontrada.");
		}
		return category;
	}
}
