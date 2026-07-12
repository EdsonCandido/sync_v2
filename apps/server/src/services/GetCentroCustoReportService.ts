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

export class GetCentroCustoReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const groups = await this.entryRepository.groupByCostCenterAndKindInPeriod({
			companyId,
			from: range.from,
			to: range.to,
		});

		const byCenter = new Map<
			string,
			{
				name: string;
				receber: number;
				pagar: number;
				receberAberto: number;
				pagarAberto: number;
				quantidade: number;
			}
		>();

		for (const g of groups) {
			const key = g.costCenterId ?? g.name;
			const current = byCenter.get(key) ?? {
				name: g.name,
				receber: 0,
				pagar: 0,
				receberAberto: 0,
				pagarAberto: 0,
				quantidade: 0,
			};
			current.quantidade += g.quantidade;
			if (g.kind === "receber") {
				current.receber += g.valorTotal;
				current.receberAberto += g.valorAberto;
			} else {
				current.pagar += g.valorTotal;
				current.pagarAberto += g.valorAberto;
			}
			byCenter.set(key, current);
		}

		const rows = Array.from(byCenter.values()).map((r) => ({
			centro: r.name,
			quantidade: r.quantidade,
			receber: r.receber,
			pagar: r.pagar,
			saldo: Math.round((r.receber - r.pagar) * 100) / 100,
			receberAberto: r.receberAberto,
			pagarAberto: r.pagarAberto,
		}));

		const totalReceber = rows.reduce((a, r) => a + Number(r.receber), 0);
		const totalPagar = rows.reduce((a, r) => a + Number(r.pagar), 0);

		return {
			meta: reportMeta("centro-custo", REPORT_TITLES["centro-custo"], range),
			kpis: [
				{ label: "Centros", value: rows.length, format: "number" },
				{ label: "Receitas", value: totalReceber, format: "money" },
				{ label: "Despesas", value: totalPagar, format: "money" },
				{
					label: "Saldo",
					value: Math.round((totalReceber - totalPagar) * 100) / 100,
					format: "money",
				},
			],
			columns: [
				{ key: "centro", label: "Centro", align: "left", format: "text" },
				{ key: "quantidade", label: "Qtd", align: "right", format: "number" },
				{ key: "receber", label: "Receber", align: "right", format: "money" },
				{ key: "pagar", label: "Pagar", align: "right", format: "money" },
				{ key: "saldo", label: "Saldo", align: "right", format: "money" },
				{
					key: "receberAberto",
					label: "Rec. aberto",
					align: "right",
					format: "money",
				},
				{
					key: "pagarAberto",
					label: "Pag. aberto",
					align: "right",
					format: "money",
				},
			],
			rows,
		};
	}
}
