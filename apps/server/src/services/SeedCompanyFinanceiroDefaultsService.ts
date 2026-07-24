import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { FinancialCategoryRepository } from "../repositories/FinancialCategoryRepository";
import {
	DEFAULT_COST_CENTERS,
	DEFAULT_FINANCIAL_CATEGORIES,
} from "../utils/defaultFinanceiroCatalog";

export class SeedCompanyFinanceiroDefaultsService {
	constructor(
		private readonly financialCategoryRepository = new FinancialCategoryRepository(),
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(params: { companyId: string; userId: string }) {
		const { companyId, userId } = params;

		for (const cat of DEFAULT_FINANCIAL_CATEGORIES) {
			const existing = await this.financialCategoryRepository.findByName(
				companyId,
				cat.name,
			);
			if (existing) {
				continue;
			}
			await this.financialCategoryRepository.create({
				companyId,
				name: cat.name,
				tipo: cat.tipo,
				cor: cat.cor,
				icone: cat.icone,
				createdBy: userId,
				updatedBy: userId,
			});
		}

		for (const cc of DEFAULT_COST_CENTERS) {
			const existing = await this.costCenterRepository.findByCodigo(
				companyId,
				cc.codigo,
			);
			if (existing) {
				continue;
			}
			await this.costCenterRepository.create({
				companyId,
				name: cc.name,
				codigo: cc.codigo,
				createdBy: userId,
				updatedBy: userId,
			});
		}
	}
}
