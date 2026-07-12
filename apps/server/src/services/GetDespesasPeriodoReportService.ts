import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
} from "@sync_v2/contracts";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import {
	formatDatePt,
	REPORT_TITLES,
	reportMeta,
	resolveReportRange,
	statusLabel,
} from "./financeiroReportShared";

export class GetDespesasPeriodoReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const [realizado, previsto, entries] = await Promise.all([
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"pagar",
				range.from,
				range.to,
			),
			this.entryRepository.sumOpenDueInRange(
				companyId,
				"pagar",
				range.from,
				range.to,
			),
			this.entryRepository.listEntriesByDueInPeriod({
				companyId,
				kind: "pagar",
				from: range.from,
				to: range.to,
			}),
		]);

		return {
			meta: reportMeta(
				"despesas-periodo",
				REPORT_TITLES["despesas-periodo"],
				range,
			),
			kpis: [
				{ label: "Realizado", value: realizado.total, format: "money" },
				{ label: "Baixas", value: realizado.count, format: "number" },
				{ label: "Previsto (aberto)", value: previsto, format: "money" },
				{
					label: "Títulos no período",
					value: entries.length,
					format: "number",
				},
			],
			columns: [
				{
					key: "vencimento",
					label: "Vencimento",
					align: "left",
					format: "date",
				},
				{
					key: "fornecedor",
					label: "Fornecedor",
					align: "left",
					format: "text",
				},
				{ key: "categoria", label: "Categoria", align: "left", format: "text" },
				{ key: "status", label: "Status", align: "left", format: "text" },
				{ key: "valorPago", label: "Pago", align: "right", format: "money" },
				{
					key: "valorAberto",
					label: "Aberto",
					align: "right",
					format: "money",
				},
			],
			rows: entries.map((e) => ({
				vencimento: formatDatePt(e.dataVencimento),
				fornecedor: e.supplierName ?? "—",
				categoria: e.categoryName ?? "—",
				status: statusLabel(e.status),
				valorPago: e.valorPago,
				valorAberto: e.valorAberto,
			})),
		};
	}
}
