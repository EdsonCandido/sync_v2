import type { UpdateCostCenterInput } from "@sync_v2/contracts";
import { CostCenterRepository } from "../repositories/CostCenterRepository";
import { AppError } from "../utils/AppError";

export class UpdateCostCenterService {
	constructor(
		private readonly costCenterRepository = new CostCenterRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateCostCenterInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.costCenterRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Centro de custo não encontrado.");
		}

		if (input.codigo !== undefined && input.codigo !== existing.codigo) {
			const byCodigo = await this.costCenterRepository.findByCodigo(
				params.companyId,
				input.codigo,
				id,
			);
			if (byCodigo) {
				throw new AppError(
					409,
					"Código de centro de custo já cadastrado nesta empresa.",
				);
			}
		}

		const updated = await this.costCenterRepository.update(
			id,
			params.companyId,
			{ ...input, updatedBy: params.userId },
		);
		if (!updated) {
			throw new AppError(404, "Centro de custo não encontrado.");
		}
		return updated;
	}
}
