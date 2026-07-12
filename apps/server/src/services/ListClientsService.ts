import type { ListClientsQuery } from "@sync_v2/contracts";
import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class ListClientsService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(query: ListClientsQuery, companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return this.clientRepository.list({
			companyId,
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});
	}
}
