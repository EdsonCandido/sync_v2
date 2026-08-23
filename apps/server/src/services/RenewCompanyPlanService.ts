import { CompanyRepository } from "../repositories/CompanyRepository";
import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";
import { withRemainingDays } from "../utils/planRemainingDays";

export class RenewCompanyPlanService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly planRepository = new PlanRepository(),
	) {}

	async execute(companyId: string, userId: string) {
		const company = await this.companyRepository.findById(companyId);
		if (!company) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		const plan = await this.planRepository.findById(company.planId);
		if (!plan || !plan.ativo) {
			throw new AppError(400, "Plano inválido ou inativo.");
		}

		const planExpiresAt = new Date();
		planExpiresAt.setDate(planExpiresAt.getDate() + plan.durationDays);

		const updated = await this.companyRepository.update(companyId, {
			planExpiresAt,
			updatedBy: userId,
		});

		if (!updated) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		return withRemainingDays(updated);
	}
}
