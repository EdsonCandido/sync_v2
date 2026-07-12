import type { CepResponse } from "@sync_v2/contracts";
import { AppError } from "../utils/AppError";

const VIA_CEP_TIMEOUT_MS = 8_000;

export class LookupCepService {
	async execute(rawCep: string): Promise<CepResponse> {
		const cep = rawCep.replace(/\D/g, "");
		if (cep.length !== 8) {
			throw new AppError(400, "CEP inválido.");
		}

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), VIA_CEP_TIMEOUT_MS);

		try {
			const response = await fetch(
				`https://viacep.com.br/ws/${cep}/json/`,
				{ signal: controller.signal },
			);

			if (!response.ok) {
				throw new AppError(502, "Erro ao consultar CEP.");
			}

			const data = (await response.json()) as {
				erro?: boolean;
				cep?: string;
				logradouro?: string;
				bairro?: string;
				localidade?: string;
				uf?: string;
			};

			if (data.erro) {
				throw new AppError(404, "CEP inexistente.");
			}

			return {
				zipCode: cep,
				street: data.logradouro ?? "",
				district: data.bairro ?? "",
				city: data.localidade ?? "",
				state: data.uf ?? "",
			};
		} catch (error) {
			if (error instanceof AppError) throw error;
			if (error instanceof Error && error.name === "AbortError") {
				throw new AppError(504, "Timeout ao consultar CEP.");
			}
			throw new AppError(502, "Erro ao consultar CEP.");
		} finally {
			clearTimeout(timer);
		}
	}
}
