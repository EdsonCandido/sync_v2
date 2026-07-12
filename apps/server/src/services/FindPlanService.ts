import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";

export class FindPlanService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute(id: string) {
		const plan = await this.planRepository.findById(id);
		if (!plan) {
			throw new AppError(404, "Plano não encontrado.");
		}
		return plan;
	}
}
