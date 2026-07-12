import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteCostCenterService {
	constructor(
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(id: string, companyId: string, userId: string) {
		const deleted = await this.costCenterRepository.softDelete(
			id,
			companyId,
			userId,
		);
		if (!deleted) {
			throw new AppError(404, "Centro de custo não encontrado.");
		}
		return deleted;
	}
}
