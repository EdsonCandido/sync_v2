import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
} from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";
import {
	formatDatePt,
	REPORT_TITLES,
	reportMeta,
	resolveReportRange,
} from "./financeiroReportShared";

export class GetExtratoFinanceiroReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		if (!query.bankAccountId) {
			throw new AppError(400, "Informe a conta bancária (bankAccountId).");
		}

		const range = resolveReportRange(query);
		const bank = await this.bankRepository.findById(
			query.bankAccountId,
			companyId,
		);
		if (!bank) {
			throw new AppError(404, "Conta bancária não encontrada.");
		}

		const [before, lines] = await Promise.all([
			this.entryRepository.sumPaymentsBeforeDateForBank({
				companyId,
				bankAccountId: query.bankAccountId,
				before: range.from,
			}),
			this.entryRepository.listExtratoLines({
				companyId,
				bankAccountId: query.bankAccountId,
				from: range.from,
				to: range.to,
			}),
		]);

		const saldoInicial =
			Math.round((bank.saldoInicial + before.credit - before.debit) * 100) /
			100;

		let running = saldoInicial;
		const rows = lines.map((line) => {
			running = Math.round((running + line.credito - line.debito) * 100) / 100;
			const parceiro =
				line.kind === "receber"
					? (line.clientName ?? "—")
					: (line.supplierName ?? "—");
			return {
				data: formatDatePt(line.dataPagamento),
				tipo: line.kind === "receber" ? "Crédito" : "Débito",
				parceiro,
				categoria: line.categoryName ?? "—",
				documento: line.documento ?? line.numero ?? "—",
				credito: line.credito,
				debito: line.debito,
				saldo: running,
			};
		});

		const totalCredito = lines.reduce((a, l) => a + l.credito, 0);
		const totalDebito = lines.reduce((a, l) => a + l.debito, 0);

		return {
			meta: reportMeta("extrato", REPORT_TITLES.extrato, range),
			kpis: [
				{ label: "Saldo inicial", value: saldoInicial, format: "money" },
				{ label: "Créditos", value: totalCredito, format: "money" },
				{ label: "Débitos", value: totalDebito, format: "money" },
				{ label: "Saldo final", value: running, format: "money" },
			],
			columns: [
				{ key: "data", label: "Data", align: "left", format: "text" },
				{ key: "tipo", label: "Tipo", align: "left", format: "text" },
				{ key: "parceiro", label: "Parceiro", align: "left", format: "text" },
				{ key: "categoria", label: "Categoria", align: "left", format: "text" },
				{ key: "documento", label: "Documento", align: "left", format: "text" },
				{ key: "credito", label: "Crédito", align: "right", format: "money" },
				{ key: "debito", label: "Débito", align: "right", format: "money" },
				{ key: "saldo", label: "Saldo", align: "right", format: "money" },
			],
			rows,
			bankAccountId: bank.id,
			bankAccountLabel: `${bank.banco} — ag ${bank.agencia} / cc ${bank.conta}`,
			saldoInicial,
			saldoFinal: running,
		};
	}
}
