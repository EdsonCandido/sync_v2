import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
} from "@sync_v2/contracts";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import {
	REPORT_TITLES,
	reportMeta,
	resolveReportRange,
} from "./financeiroReportShared";

export class GetReceitasClienteReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const rows = await this.entryRepository.groupByClientInPeriod({
			companyId,
			from: range.from,
			to: range.to,
		});

		const total = rows.reduce((a, r) => a + r.valorTotal, 0);
		const aberto = rows.reduce((a, r) => a + r.valorAberto, 0);

		return {
			meta: reportMeta(
				"receitas-cliente",
				REPORT_TITLES["receitas-cliente"],
				range,
			),
			kpis: [
				{ label: "Clientes", value: rows.length, format: "number" },
				{ label: "Valor total", value: total, format: "money" },
				{ label: "Valor em aberto", value: aberto, format: "money" },
			],
			columns: [
				{ key: "cliente", label: "Cliente", align: "left", format: "text" },
				{ key: "quantidade", label: "Qtd", align: "right", format: "number" },
				{ key: "valorPago", label: "Pago", align: "right", format: "money" },
				{
					key: "valorAberto",
					label: "Aberto",
					align: "right",
					format: "money",
				},
				{ key: "valorTotal", label: "Total", align: "right", format: "money" },
			],
			rows: rows.map((r) => ({
				cliente: r.clientName,
				quantidade: r.quantidade,
				valorPago: r.valorPago,
				valorAberto: r.valorAberto,
				valorTotal: r.valorTotal,
			})),
		};
	}
}
