import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class FindClientService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(id: string, companyId: string) {
		const client = await this.clientRepository.findById(id, companyId);
		if (!client) {
			throw new AppError(404, "Cliente não encontrado.");
		}
		return client;
	}
}
