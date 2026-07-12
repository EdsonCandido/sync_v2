import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteClientService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(id: string, companyId: string, userId: string) {
		const deleted = await this.clientRepository.softDelete(
			id,
			companyId,
			userId,
		);
		if (!deleted) {
			throw new AppError(404, "Cliente não encontrado.");
		}
		return deleted;
	}
}
