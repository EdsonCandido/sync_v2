import type { UpdateFinancialEntryInput } from "@sync_v2/contracts";
import {
	calcValorAberto,
	FinancialEntryRepository,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class UpdateFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateFinancialEntryInput,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(id, params.companyId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		if (entry.status === "cancelado" || entry.status === "pago") {
			throw new AppError(400, "Lançamento não pode ser alterado.");
		}

		const desconto = input.desconto ?? entry.desconto;
		const acrescimo = input.acrescimo ?? entry.acrescimo;
		const juros = input.juros ?? entry.juros;
		const multa = input.multa ?? entry.multa;
		const valorAberto = calcValorAberto(
			entry.valorOriginal,
			desconto,
			acrescimo,
			juros,
			multa,
			entry.valorPago,
		);

		const updated = await this.entryRepository.update(id, params.companyId, {
			...input,
			desconto,
			acrescimo,
			juros,
			multa,
			valorAberto,
			updatedBy: params.userId,
		});
		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId: id,
			action: "updated",
			userId: params.userId,
			ip: params.ip,
			payload: input,
		});
		return updated;
	}
}
