import type { UpdateClientInput } from "@sync_v2/contracts";
import { ClientRepository } from "../repositories/ClientRepository";
import { AppError } from "../utils/AppError";

export class UpdateClientService {
	constructor(private readonly clientRepository = new ClientRepository()) {}

	async execute(
		id: string,
		input: UpdateClientInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.clientRepository.findById(id, params.companyId);
		if (!existing) {
			throw new AppError(404, "Cliente não encontrado.");
		}

		if (input.document) {
			const document = normalizeDocument(input.document);
			if (!/^[A-Za-z0-9]+$/.test(document)) {
				throw new AppError(
					400,
					"Documento deve conter apenas letras e números.",
				);
			}
			const byDoc = await this.clientRepository.findByDocument(
				params.companyId,
				document,
				id,
			);
			if (byDoc) {
				throw new AppError(409, "Documento já cadastrado nesta empresa.");
			}
			input.document = document;
		}

		if (input.email) {
			input.email = input.email.toLowerCase();
		}

		if (input.state) {
			input.state = input.state.toUpperCase();
		}

		if (input.zipCode) {
			input.zipCode = input.zipCode.replace(/\D/g, "");
		}

		const personType = input.personType ?? existing.personType;
		if (personType === "PJ") {
			const tradeName =
				input.tradeName !== undefined
					? input.tradeName?.trim() || null
					: existing.tradeName;
			if (!tradeName) {
				throw new AppError(400, "Nome fantasia obrigatório para PJ.");
			}
			if (input.tradeName !== undefined) {
				input.tradeName = tradeName;
			}
		}

		const payload = Object.fromEntries(
			Object.entries({
				...input,
				updatedBy: params.userId,
			}).filter(([, value]) => value !== undefined),
		) as UpdateClientInput & { updatedBy?: string | null };

		const updated = await this.clientRepository.update(
			id,
			params.companyId,
			payload,
		);
		if (!updated) {
			throw new AppError(404, "Cliente não encontrado.");
		}
		return updated;
	}
}

function normalizeDocument(document: string) {
	return document.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
