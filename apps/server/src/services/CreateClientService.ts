import type { CreateClientInput } from "@sync_v2/contracts";
import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class CreateClientService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(
		input: CreateClientInput,
		params: { companyId: string; userId: string },
	) {
		const document = normalizeDocument(input.document);
		if (!/^[A-Za-z0-9]+$/.test(document)) {
			throw new AppError(400, "Documento deve conter apenas letras e números.");
		}

		const byDoc = await this.clientRepository.findByDocument(
			params.companyId,
			document,
		);
		if (byDoc) {
			throw new AppError(409, "Documento já cadastrado nesta empresa.");
		}

		const tradeName =
			input.personType === "PJ"
				? (input.tradeName?.trim() ?? null)
				: input.tradeName?.trim() || null;

		if (input.personType === "PJ" && !tradeName) {
			throw new AppError(400, "Nome fantasia obrigatório para PJ.");
		}

		return this.clientRepository.create({
			...input,
			document,
			tradeName,
			email: input.email.toLowerCase(),
			state: input.state.toUpperCase(),
			zipCode: input.zipCode.replace(/\D/g, ""),
			companyId: params.companyId,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
	}
}

function normalizeDocument(document: string) {
	return document.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
