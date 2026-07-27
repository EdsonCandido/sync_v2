import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class FindItrClientByDocumentService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(documentRaw: string, companyId: string) {
		const document = documentRaw.replace(/\D/g, "");
		if (document.length !== 11) {
			throw new AppError(400, "CPF deve ter 11 dígitos.");
		}

		const client = await this.clientRepository.findByDocument(
			companyId,
			document,
		);
		if (!client) {
			return null;
		}

		return {
			id: client.id,
			document: client.document,
			name: client.name,
			email: client.email,
			phone: client.phone,
		};
	}
}
