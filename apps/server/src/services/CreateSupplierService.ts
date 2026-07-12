import type { CreateSupplierInput } from "@sync_v2/contracts";
import { SupplierRepository } from "../repositories/SupplierRepository";

export class CreateSupplierService {
	constructor(private readonly supplierRepository = new SupplierRepository()) {}

	async execute(
		input: CreateSupplierInput,
		params: { companyId: string; userId: string },
	) {
		return this.supplierRepository.create({
			...input,
			email: input.email?.trim() ? input.email.trim() : null,
			companyId: params.companyId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
	}
}
