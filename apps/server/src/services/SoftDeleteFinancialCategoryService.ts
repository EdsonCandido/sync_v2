import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteFinancialCategoryService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
	) {}

	async execute(id: string, companyId: string, userId: string) {
		const deleted = await this.financialCategoryRepository.softDelete(
			id,
			companyId,
			userId,
		);
		if (!deleted) {
			throw new AppError(404, "Categoria financeira não encontrada.");
		}
		return deleted;
	}
}
