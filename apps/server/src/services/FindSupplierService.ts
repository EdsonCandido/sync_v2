import { SupplierRepository } from "../repositories/SupplierRepository";
import { AppError } from "../utils/AppError";

export class FindSupplierService {
	constructor(private readonly supplierRepository = new SupplierRepository()) {}

	async execute(id: string, companyId: string) {
		const supplier = await this.supplierRepository.findById(id, companyId);
		if (!supplier) {
			throw new AppError(404, "Fornecedor não encontrado.");
		}
		return supplier;
	}
}
