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

export class GetClientesDevedoresReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const rows = await this.entryRepository.groupOverdueByClient({
			companyId,
			asOf: range.to,
		});
		const total = rows.reduce((a, r) => a + r.valorAberto, 0);

		return {
			meta: reportMeta(
				"clientes-devedores",
				REPORT_TITLES["clientes-devedores"],
				range,
			),
			kpis: [
				{ label: "Clientes devedores", value: rows.length, format: "number" },
				{ label: "Valor em atraso", value: total, format: "money" },
			],
			columns: [
				{ key: "cliente", label: "Cliente", align: "left", format: "text" },
				{
					key: "quantidade",
					label: "Títulos",
					align: "right",
					format: "number",
				},
				{
					key: "valorAberto",
					label: "Em atraso",
					align: "right",
					format: "money",
				},
			],
			rows: rows.map((r) => ({
				cliente: r.clientName,
				quantidade: r.quantidade,
				valorAberto: r.valorAberto,
			})),
		};
	}
}
