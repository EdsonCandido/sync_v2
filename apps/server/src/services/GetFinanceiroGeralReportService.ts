import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
} from "@sync_v2/contracts";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import {
	REPORT_TITLES,
	reportMeta,
	resolveReportRange,
} from "./financeiroReportShared";

export class GetFinanceiroGeralReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const [
			recebimentos,
			pagamentos,
			previstoReceber,
			previstoPagar,
			vencidoReceber,
			vencidoPagar,
			saldoBancos,
		] = await Promise.all([
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"receber",
				range.from,
				range.to,
			),
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"pagar",
				range.from,
				range.to,
			),
			this.entryRepository.sumOpenDueInRange(
				companyId,
				"receber",
				range.from,
				range.to,
			),
			this.entryRepository.sumOpenDueInRange(
				companyId,
				"pagar",
				range.from,
				range.to,
			),
			this.entryRepository.sumOpenOverdueInRange(
				companyId,
				"receber",
				range.from,
				range.to,
				new Date(),
			),
			this.entryRepository.sumOpenOverdueInRange(
				companyId,
				"pagar",
				range.from,
				range.to,
				new Date(),
			),
			this.bankRepository.sumSaldoAtual(companyId),
		]);

		const lucro = recebimentos.total - pagamentos.total;

		return {
			meta: reportMeta("geral", REPORT_TITLES.geral, range),
			kpis: [
				{ label: "Saldo em bancos", value: saldoBancos, format: "money" },
				{
					label: "Recebimentos (realizado)",
					value: recebimentos.total,
					format: "money",
				},
				{
					label: "Pagamentos (realizado)",
					value: pagamentos.total,
					format: "money",
				},
				{ label: "Lucro realizado", value: lucro, format: "money" },
				{
					label: "A receber (previsto)",
					value: previstoReceber,
					format: "money",
				},
				{ label: "A pagar (previsto)", value: previstoPagar, format: "money" },
				{
					label: "Receber vencido",
					value: vencidoReceber,
					format: "money",
				},
				{ label: "Pagar vencido", value: vencidoPagar, format: "money" },
			],
			columns: [
				{ key: "item", label: "Item", align: "left", format: "text" },
				{ key: "valor", label: "Valor", align: "right", format: "money" },
			],
			rows: [
				{ item: "Recebimentos realizados", valor: recebimentos.total },
				{ item: "Pagamentos realizados", valor: pagamentos.total },
				{ item: "Lucro realizado", valor: lucro },
				{ item: "A receber previsto", valor: previstoReceber },
				{ item: "A pagar previsto", valor: previstoPagar },
				{ item: "Receber vencido no período", valor: vencidoReceber },
				{ item: "Pagar vencido no período", valor: vencidoPagar },
			],
		};
	}
}
