import type { CreateCostCenterInput } from "@sync_v2/contracts";
import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { AppError } from "../utils/AppError";

export class CreateCostCenterService {
	constructor(
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(
		input: CreateCostCenterInput,
		params: { companyId: string; userId: string },
	) {
		const byCodigo = await this.costCenterRepository.findByCodigo(
			params.companyId,
			input.codigo,
		);
		if (byCodigo) {
			throw new AppError(
				409,
				"Código de centro de custo já cadastrado nesta empresa.",
			);
		}

		return this.costCenterRepository.create({
			...input,
			companyId: params.companyId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
	}
}
