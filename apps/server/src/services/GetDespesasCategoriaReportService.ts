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

export class GetDespesasCategoriaReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const rows = await this.entryRepository.groupExpensesByCategoryInPeriod({
			companyId,
			from: range.from,
			to: range.to,
		});

		const total = rows.reduce((a, r) => a + r.valorTotal, 0);

		return {
			meta: reportMeta(
				"despesas-categoria",
				REPORT_TITLES["despesas-categoria"],
				range,
			),
			kpis: [
				{ label: "Categorias", value: rows.length, format: "number" },
				{ label: "Valor total", value: total, format: "money" },
			],
			columns: [
				{ key: "categoria", label: "Categoria", align: "left", format: "text" },
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
				categoria: r.categoryName,
				quantidade: r.quantidade,
				valorPago: r.valorPago,
				valorAberto: r.valorAberto,
				valorTotal: r.valorTotal,
			})),
		};
	}
}
