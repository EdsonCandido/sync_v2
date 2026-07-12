import type { RenegotiateFinancialEntryInput } from "@sync_v2/contracts";
import { createId } from "@sync_v2/utils";
import {
	FinancialEntryRepository,
	round2,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

function addMonths(date: Date, months: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}

export class RenegotiateFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		entryId: string,
		input: RenegotiateFinancialEntryInput,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(
			entryId,
			params.companyId,
		);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		if (entry.status === "cancelado") {
			throw new AppError(400, "Lançamento cancelado.");
		}
		if (entry.status === "pago") {
			throw new AppError(400, "Lançamento já liquidado.");
		}

		const toCancel = entry.installmentGroupId
			? await this.entryRepository.listOpenByGroup(
					params.companyId,
					entry.installmentGroupId,
				)
			: [entry];

		for (const item of toCancel) {
			await this.entryRepository.cancel(
				item.id,
				params.companyId,
				params.userId,
			);
			await this.entryRepository.addHistory({
				companyId: params.companyId,
				entryId: item.id,
				action: "renegotiated",
				userId: params.userId,
				ip: params.ip,
				payload: { replacedByGroup: true },
			});
		}

		const groupId = createId();
		const base = round2(input.valorTotal / input.parcelas);
		const valores = Array.from({ length: input.parcelas }, () => base);
		const soma = round2(valores.reduce((a, b) => a + b, 0));
		const lastIndex = input.parcelas - 1;
		const lastValor = valores[lastIndex] ?? base;
		valores[lastIndex] = round2(lastValor + (input.valorTotal - soma));

		const created = await this.entryRepository.createMany(
			valores.map((valor, index) => ({
				companyId: params.companyId,
				kind: entry.kind,
				originType: entry.originType,
				originLabel: entry.originLabel,
				kanbanCardId: entry.kanbanCardId,
				clientId: entry.clientId,
				supplierId: entry.supplierId,
				categoryId: input.categoryId ?? entry.categoryId,
				costCenterId: input.costCenterId ?? entry.costCenterId,
				bankAccountId: input.bankAccountId ?? entry.bankAccountId,
				documento: entry.documento,
				numero: `${index + 1}/${input.parcelas}`,
				valorOriginal: valor,
				valorAberto: valor,
				dataEmissao: new Date(),
				dataVencimento: addMonths(input.primeiraDataVencimento, index),
				observacoes: input.observacoes ?? entry.observacoes,
				installmentGroupId: groupId,
				installmentNumber: index + 1,
				installmentTotal: input.parcelas,
				createdBy: params.userId,
				updatedBy: params.userId,
			})),
		);

		for (const item of created) {
			await this.entryRepository.addHistory({
				companyId: params.companyId,
				entryId: item.id,
				action: "created",
				userId: params.userId,
				ip: params.ip,
				payload: { renegotiationFrom: entryId, groupId },
			});
		}

		return {
			cancelled: toCancel.map((i) => i.id),
			items: created,
			installmentGroupId: groupId,
		};
	}
}
