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

function bankLabel(r: {
	banco: string;
	agencia: string;
	conta: string;
}): string {
	if (!r.agencia && !r.conta) return r.banco;
	return `${r.banco} — ag ${r.agencia} / cc ${r.conta}`;
}

export class GetPagamentosBancoReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const rows = await this.entryRepository.sumPaymentsGroupedByBank({
			companyId,
			kind: "pagar",
			from: range.from,
			to: range.to,
		});
		const total = rows.reduce((a, r) => a + r.total, 0);

		return {
			meta: reportMeta(
				"pagamentos-banco",
				REPORT_TITLES["pagamentos-banco"],
				range,
			),
			kpis: [
				{ label: "Contas", value: rows.length, format: "number" },
				{ label: "Total pago", value: total, format: "money" },
			],
			columns: [
				{ key: "banco", label: "Banco", align: "left", format: "text" },
				{ key: "quantidade", label: "Qtd", align: "right", format: "number" },
				{ key: "total", label: "Total", align: "right", format: "money" },
			],
			rows: rows.map((r) => ({
				banco: bankLabel(r),
				quantidade: r.quantidade,
				total: r.total,
			})),
		};
	}
}
