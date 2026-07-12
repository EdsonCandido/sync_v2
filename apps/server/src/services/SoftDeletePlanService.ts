import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";

export class SoftDeletePlanService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute(id: string) {
		const existing = await this.planRepository.findById(id);
		if (!existing) {
			throw new AppError(404, "Plano não encontrado.");
		}

		const linked =
			await this.planRepository.countActiveCompaniesByPlanId(id);
		if (linked > 0) {
			throw new AppError(
				409,
				"Não é possível excluir: existem empresas ativas vinculadas a este plano.",
			);
		}

		const deleted = await this.planRepository.softDelete(id);
		if (!deleted) {
			throw new AppError(404, "Plano não encontrado.");
		}
		return deleted;
	}
}
