import { PlanRepository } from "../repositories/PlanRepository";

export class ListPlanOptionsService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute() {
		return this.planRepository.listActive();
	}
}
