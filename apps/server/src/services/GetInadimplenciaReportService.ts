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
} from "./financeiroReportShared";

function agingBucket(dias: number): string {
	if (dias <= 30) return "0–30 dias";
	if (dias <= 60) return "31–60 dias";
	if (dias <= 90) return "61–90 dias";
	return "90+ dias";
}

export class GetInadimplenciaReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const asOf = range.to;
		const entries = await this.entryRepository.listOverdueEntries({
			companyId,
			asOf,
		});

		const agingMap = new Map<
			string,
			{ bucket: string; quantidade: number; valor: number }
		>();
		for (const bucket of [
			"0–30 dias",
			"31–60 dias",
			"61–90 dias",
			"90+ dias",
		]) {
			agingMap.set(bucket, { bucket, quantidade: 0, valor: 0 });
		}

		for (const e of entries) {
			const key = agingBucket(e.diasAtraso);
			const current = agingMap.get(key)!;
			current.quantidade += 1;
			current.valor += e.valorAberto;
		}

		const aging = Array.from(agingMap.values()).map((a) => ({
			...a,
			valor: Math.round(a.valor * 100) / 100,
		}));
		const total = entries.reduce((a, e) => a + e.valorAberto, 0);

		return {
			meta: reportMeta("inadimplencia", REPORT_TITLES.inadimplencia, range),
			kpis: [
				{ label: "Títulos vencidos", value: entries.length, format: "number" },
				{ label: "Valor em atraso", value: total, format: "money" },
			],
			columns: [
				{
					key: "vencimento",
					label: "Vencimento",
					align: "left",
					format: "date",
				},
				{ key: "kind", label: "Tipo", align: "left", format: "text" },
				{ key: "parceiro", label: "Parceiro", align: "left", format: "text" },
				{ key: "categoria", label: "Categoria", align: "left", format: "text" },
				{ key: "diasAtraso", label: "Dias", align: "right", format: "number" },
				{ key: "aging", label: "Faixa", align: "left", format: "text" },
				{
					key: "valorAberto",
					label: "Aberto",
					align: "right",
					format: "money",
				},
			],
			rows: entries.map((e) => ({
				vencimento: formatDatePt(e.dataVencimento),
				kind: e.kind === "receber" ? "Receber" : "Pagar",
				parceiro:
					e.kind === "receber"
						? (e.clientName ?? "—")
						: (e.supplierName ?? "—"),
				categoria: e.categoryName ?? "—",
				diasAtraso: e.diasAtraso,
				aging: agingBucket(e.diasAtraso),
				valorAberto: e.valorAberto,
			})),
			aging,
		};
	}
}
