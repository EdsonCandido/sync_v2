import type { ListSuppliersQuery } from "@sync_v2/contracts";
import { SupplierRepository } from "../repositories/SupplierRepository";
import { AppError } from "../utils/AppError";

export class ListSuppliersService {
	constructor(private readonly supplierRepository = new SupplierRepository()) {}

	async execute(query: ListSuppliersQuery, companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return this.supplierRepository.list({
			companyId,
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});
	}
}
