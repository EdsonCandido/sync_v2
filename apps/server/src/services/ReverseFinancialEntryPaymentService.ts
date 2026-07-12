import { BankAccountRepository } from "../repositories/BankAccountRepository";
import {
	calcValorAberto,
	FinancialEntryRepository,
	round2,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class ReverseFinancialEntryPaymentService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
	) {}

	async execute(
		entryId: string,
		paymentId: string,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(
			entryId,
			params.companyId,
		);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");

		const payment = await this.entryRepository.findPayment(
			paymentId,
			params.companyId,
		);
		if (!payment || payment.entryId !== entryId) {
			throw new AppError(404, "Baixa não encontrada.");
		}
		if (payment.estornado) {
			throw new AppError(400, "Baixa já estornada.");
		}

		await this.entryRepository.reversePayment(
			paymentId,
			params.companyId,
			params.userId,
		);

		const novoPago = round2(entry.valorPago - payment.valor);
		const safePago = Math.max(0, novoPago);
		const novoAberto = calcValorAberto(
			entry.valorOriginal,
			Math.max(0, entry.desconto - payment.desconto),
			entry.acrescimo,
			Math.max(0, entry.juros - payment.juros),
			Math.max(0, entry.multa - payment.multa),
			safePago,
		);
		const status =
			safePago <= 0.009
				? "em_aberto"
				: novoAberto <= 0.009
					? "pago"
					: "parcial";

		await this.entryRepository.update(entryId, params.companyId, {
			valorPago: safePago,
			valorAberto: novoAberto,
			desconto: Math.max(0, entry.desconto - payment.desconto),
			juros: Math.max(0, entry.juros - payment.juros),
			multa: Math.max(0, entry.multa - payment.multa),
			status,
			dataLiquidacao: status === "pago" ? entry.dataLiquidacao : null,
			updatedBy: params.userId,
		});

		if (payment.bankAccountId) {
			const delta = entry.kind === "receber" ? -payment.valor : payment.valor;
			await this.bankRepository.adjustSaldo(
				payment.bankAccountId,
				params.companyId,
				delta,
				params.userId,
			);
		}

		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId,
			action: "reversed",
			userId: params.userId,
			ip: params.ip,
			payload: { paymentId, valor: payment.valor },
		});

		return this.entryRepository.findById(entryId, params.companyId);
	}
}
