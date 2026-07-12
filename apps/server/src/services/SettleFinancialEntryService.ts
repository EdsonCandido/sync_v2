import type { SettleFinancialEntryInput } from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import {
	calcValorAberto,
	FinancialEntryRepository,
	round2,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class SettleFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
	) {}

	async execute(
		entryId: string,
		input: SettleFinancialEntryInput,
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

		const bank = await this.bankRepository.findById(
			input.bankAccountId,
			params.companyId,
		);
		if (!bank) throw new AppError(404, "Conta bancária não encontrada.");

		const valorBaixa = round2(input.valor);
		if (valorBaixa > entry.valorAberto + 0.009) {
			throw new AppError(400, "Valor maior que o em aberto.");
		}

		const payment = await this.entryRepository.createPayment({
			companyId: params.companyId,
			entryId,
			bankAccountId: input.bankAccountId,
			valor: valorBaixa,
			juros: input.juros ?? 0,
			multa: input.multa ?? 0,
			desconto: input.desconto ?? 0,
			dataPagamento: input.dataPagamento,
			observacoes: input.observacoes ?? null,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
		if (!payment) throw new AppError(500, "Falha ao registrar baixa.");

		const novoPago = round2(entry.valorPago + valorBaixa);
		const novoAberto = calcValorAberto(
			entry.valorOriginal,
			entry.desconto + (input.desconto ?? 0),
			entry.acrescimo,
			entry.juros + (input.juros ?? 0),
			entry.multa + (input.multa ?? 0),
			novoPago,
		);
		const status =
			novoAberto <= 0.009 ? "pago" : novoPago > 0 ? "parcial" : "em_aberto";

		await this.entryRepository.update(entryId, params.companyId, {
			valorPago: novoPago,
			valorAberto: novoAberto <= 0.009 ? 0 : novoAberto,
			desconto: entry.desconto + (input.desconto ?? 0),
			juros: entry.juros + (input.juros ?? 0),
			multa: entry.multa + (input.multa ?? 0),
			status,
			dataLiquidacao: status === "pago" ? input.dataPagamento : null,
			bankAccountId: input.bankAccountId,
			updatedBy: params.userId,
		});

		const delta = entry.kind === "receber" ? valorBaixa : -valorBaixa;
		await this.bankRepository.adjustSaldo(
			input.bankAccountId,
			params.companyId,
			delta,
			params.userId,
		);

		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId,
			action: entry.kind === "receber" ? "received" : "paid",
			userId: params.userId,
			ip: params.ip,
			payload: {
				paymentId: payment.id,
				valor: valorBaixa,
				status,
			},
		});

		return this.entryRepository.findById(entryId, params.companyId);
	}
}
