import type { ListPlansQuery } from "@sync_v2/contracts";
import { PlanRepository } from "../repositories/PlanRepository";

export class ListPlansService {
	constructor(private readonly planRepository = new PlanRepository()) {}

	async execute(query: ListPlansQuery) {
		return this.planRepository.list(query);
	}
}
