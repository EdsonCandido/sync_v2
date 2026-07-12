import type { UpdatePlanInput } from "@sync_v2/contracts";
import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";

export class UpdatePlanService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute(id: string, input: UpdatePlanInput) {
		const existing = await this.planRepository.findById(id);
		if (!existing) {
			throw new AppError(404, "Plano não encontrado.");
		}

		const startDate = input.startDate ?? existing.startDate;
		const endDate = input.endDate ?? existing.endDate;
		if (endDate < startDate) {
			throw new AppError(400, "Data final deve ser posterior à data inicial.");
		}

		if (input.name) {
			const byName = await this.planRepository.findByName(input.name, id);
			if (byName) {
				throw new AppError(409, "Já existe um plano com este nome.");
			}
		}

		const payload = Object.fromEntries(
			Object.entries(input).filter(([, value]) => value !== undefined),
		) as UpdatePlanInput;

		const updated = await this.planRepository.update(id, payload);
		if (!updated) {
			throw new AppError(404, "Plano não encontrado.");
		}
		return updated;
	}
}
