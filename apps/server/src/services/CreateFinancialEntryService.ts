import type { CreateFinancialEntryInput } from "@sync_v2/contracts";
import { createId } from "@sync_v2/utils";
import {
	calcValorAberto,
	FinancialEntryRepository,
	round2,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

function addMonths(date: Date, months: number) {
	const d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}

export class CreateFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		input: CreateFinancialEntryInput,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const parcelas = input.parcelas && input.parcelas > 1 ? input.parcelas : 1;
		const desconto = input.desconto ?? 0;
		const acrescimo = input.acrescimo ?? 0;
		const juros = input.juros ?? 0;
		const multa = input.multa ?? 0;
		const totalLiquido = calcValorAberto(
			input.valorOriginal,
			desconto,
			acrescimo,
			juros,
			multa,
			0,
		);
		if (totalLiquido <= 0) {
			throw new AppError(400, "Valor em aberto deve ser maior que zero.");
		}

		if (parcelas === 1) {
			const entry = await this.entryRepository.create({
				companyId: params.companyId,
				kind: input.kind,
				originType: input.originType ?? "avulsa",
				originLabel: input.originLabel ?? null,
				kanbanCardId: input.kanbanCardId ?? null,
				clientId: input.clientId ?? null,
				supplierId: input.supplierId ?? null,
				categoryId: input.categoryId ?? null,
				costCenterId: input.costCenterId ?? null,
				bankAccountId: input.bankAccountId ?? null,
				documento: input.documento ?? null,
				numero: input.numero ?? null,
				valorOriginal: input.valorOriginal,
				desconto,
				acrescimo,
				juros,
				multa,
				valorPago: 0,
				valorAberto: totalLiquido,
				dataEmissao: input.dataEmissao,
				dataVencimento: input.dataVencimento,
				observacoes: input.observacoes ?? null,
				createdBy: params.userId,
				updatedBy: params.userId,
			});
			if (!entry) throw new AppError(500, "Falha ao criar lançamento.");
			await this.entryRepository.addHistory({
				companyId: params.companyId,
				entryId: entry.id,
				action: "created",
				userId: params.userId,
				ip: params.ip,
				payload: { valorOriginal: entry.valorOriginal },
			});
			return this.entryRepository.findById(entry.id, params.companyId);
		}

		const groupId = createId();
		const modo = input.parcelamentoModo === "repetir" ? "repetir" : "dividir";
		let valores: number[];
		if (modo === "repetir") {
			const unit = round2(totalLiquido);
			valores = Array.from({ length: parcelas }, () => unit);
		} else {
			const base = round2(totalLiquido / parcelas);
			valores = Array.from({ length: parcelas }, () => base);
			const soma = round2(valores.reduce((a, b) => a + b, 0));
			const lastIndex = parcelas - 1;
			const lastValor = valores[lastIndex] ?? base;
			valores[lastIndex] = round2(lastValor + (totalLiquido - soma));
		}

		const rows = valores.map((valor, index) => ({
			companyId: params.companyId,
			kind: input.kind,
			originType: input.originType ?? "avulsa",
			originLabel: input.originLabel ?? null,
			kanbanCardId: input.kanbanCardId ?? null,
			clientId: input.clientId ?? null,
			supplierId: input.supplierId ?? null,
			categoryId: input.categoryId ?? null,
			costCenterId: input.costCenterId ?? null,
			bankAccountId: input.bankAccountId ?? null,
			documento: input.documento ?? null,
			numero: input.numero
				? `${input.numero}-${index + 1}/${parcelas}`
				: `${index + 1}/${parcelas}`,
			valorOriginal: valor,
			desconto: 0,
			acrescimo: 0,
			juros: 0,
			multa: 0,
			valorPago: 0,
			valorAberto: valor,
			dataEmissao: input.dataEmissao,
			dataVencimento: addMonths(input.dataVencimento, index),
			observacoes: input.observacoes ?? null,
			installmentGroupId: groupId,
			installmentNumber: index + 1,
			installmentTotal: parcelas,
			createdBy: params.userId,
			updatedBy: params.userId,
		}));

		const created = await this.entryRepository.createMany(rows);
		for (const entry of created) {
			await this.entryRepository.addHistory({
				companyId: params.companyId,
				entryId: entry.id,
				action: "installment",
				userId: params.userId,
				ip: params.ip,
				payload: {
					groupId,
					installmentNumber: entry.installmentNumber,
					installmentTotal: parcelas,
				},
			});
		}
		return {
			items: created,
			installmentGroupId: groupId,
			total: created.length,
		};
	}
}
