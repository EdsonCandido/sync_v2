import type { UpdateSupplierInput } from "@sync_v2/contracts";
import { SupplierRepository } from "../repositories/SupplierRepository";
import { AppError } from "../utils/AppError";

export class UpdateSupplierService {
	constructor(private readonly supplierRepository = new SupplierRepository()) {}

	async execute(
		id: string,
		input: UpdateSupplierInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.supplierRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Fornecedor não encontrado.");
		}

		const payload: UpdateSupplierInput & { updatedBy?: string | null } = {
			...input,
			updatedBy: params.userId,
		};

		if (input.email !== undefined) {
			payload.email = input.email?.trim() ? input.email.trim() : null;
		}

		const updated = await this.supplierRepository.update(
			id,
			params.companyId,
			payload,
		);
		if (!updated) {
			throw new AppError(404, "Fornecedor não encontrado.");
		}
		return updated;
	}
}
