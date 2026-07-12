import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { AppError } from "../utils/AppError";

export class FindCostCenterService {
	constructor(
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const costCenter = await this.costCenterRepository.findById(id, companyId);
		if (!costCenter) {
			throw new AppError(404, "Centro de custo não encontrado.");
		}
		return costCenter;
	}
}
