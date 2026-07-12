import type { CreatePlanInput } from "@sync_v2/contracts";
import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";

export class CreatePlanService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute(input: CreatePlanInput) {
		if (input.endDate < input.startDate) {
			throw new AppError(400, "Data final deve ser posterior à data inicial.");
		}

		const byName = await this.planRepository.findByName(input.name);
		if (byName) {
			throw new AppError(409, "Já existe um plano com este nome.");
		}

		return this.planRepository.create(input);
	}
}
