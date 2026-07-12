import { SupplierRepository } from "../repositories/SupplierRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteSupplierService {
	constructor(private readonly supplierRepository = new SupplierRepository()) {}

	async execute(id: string, companyId: string, userId: string) {
		const deleted = await this.supplierRepository.softDelete(
			id,
			companyId,
			userId,
		);
		if (!deleted) {
			throw new AppError(404, "Fornecedor não encontrado.");
		}
		return deleted;
	}
}
