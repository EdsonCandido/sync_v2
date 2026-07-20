import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
} from "@sync_v2/contracts";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import {
	eachDayIso,
	isSameCalendarMonth,
	REPORT_TITLES,
	reportMeta,
	resolveReportRange,
	toIsoMonth,
} from "./financeiroReportShared";

type DayPoint = {
	date: string;
	entradasRealizadas: number;
	saidasRealizadas: number;
	entradasPrevistas: number;
	saidasPrevistas: number;
	saldoAcumulado: number;
};

function aggregateSeriesByMonth(daily: DayPoint[]): DayPoint[] {
	const byMonth = new Map<string, DayPoint>();
	for (const day of daily) {
		const month = toIsoMonth(day.date);
		const existing = byMonth.get(month);
		if (!existing) {
			byMonth.set(month, {
				date: month,
				entradasRealizadas: day.entradasRealizadas,
				saidasRealizadas: day.saidasRealizadas,
				entradasPrevistas: day.entradasPrevistas,
				saidasPrevistas: day.saidasPrevistas,
				saldoAcumulado: day.saldoAcumulado,
			});
			continue;
		}
		existing.entradasRealizadas += day.entradasRealizadas;
		existing.saidasRealizadas += day.saidasRealizadas;
		existing.entradasPrevistas += day.entradasPrevistas;
		existing.saidasPrevistas += day.saidasPrevistas;
		existing.saldoAcumulado = day.saldoAcumulado;
	}
	return Array.from(byMonth.values());
}

export class GetFluxoCaixaReportService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		companyId: string,
		query: FinanceiroReportQuery,
	): Promise<FinanceiroReportResponse> {
		const range = resolveReportRange(query);
		const [entradasReal, saidasReal, entradasPrev, saidasPrev] =
			await Promise.all([
				this.entryRepository.sumPaymentsGroupedByDay(
					companyId,
					"receber",
					range.from,
					range.to,
				),
				this.entryRepository.sumPaymentsGroupedByDay(
					companyId,
					"pagar",
					range.from,
					range.to,
				),
				this.entryRepository.sumOpenDueGroupedByDay(
					companyId,
					"receber",
					range.from,
					range.to,
				),
				this.entryRepository.sumOpenDueGroupedByDay(
					companyId,
					"pagar",
					range.from,
					range.to,
				),
			]);

		const mapDay = (rows: Array<{ day: string; total: number }>) => {
			const m = new Map<string, number>();
			for (const r of rows) m.set(r.day, r.total);
			return m;
		};

		const er = mapDay(entradasReal);
		const sr = mapDay(saidasReal);
		const ep = mapDay(entradasPrev);
		const sp = mapDay(saidasPrev);

		let saldo = 0;
		const dailySeries = eachDayIso(range.from, range.to).map((date) => {
			const entradasRealizadas = er.get(date) ?? 0;
			const saidasRealizadas = sr.get(date) ?? 0;
			const entradasPrevistas = ep.get(date) ?? 0;
			const saidasPrevistas = sp.get(date) ?? 0;
			saldo +=
				entradasRealizadas -
				saidasRealizadas +
				entradasPrevistas -
				saidasPrevistas;
			return {
				date,
				entradasRealizadas,
				saidasRealizadas,
				entradasPrevistas,
				saidasPrevistas,
				saldoAcumulado: Math.round(saldo * 100) / 100,
			};
		});

		const series = isSameCalendarMonth(range.from, range.to)
			? dailySeries
			: aggregateSeriesByMonth(dailySeries);

		const totER = entradasReal.reduce((a, r) => a + r.total, 0);
		const totSR = saidasReal.reduce((a, r) => a + r.total, 0);
		const totEP = entradasPrev.reduce((a, r) => a + r.total, 0);
		const totSP = saidasPrev.reduce((a, r) => a + r.total, 0);

		return {
			meta: reportMeta("fluxo-caixa", REPORT_TITLES["fluxo-caixa"], range),
			kpis: [
				{ label: "Entradas realizadas", value: totER, format: "money" },
				{ label: "Saídas realizadas", value: totSR, format: "money" },
				{ label: "Entradas previstas", value: totEP, format: "money" },
				{ label: "Saídas previstas", value: totSP, format: "money" },
				{
					label: "Saldo acumulado (fim)",
					value: dailySeries.at(-1)?.saldoAcumulado ?? 0,
					format: "money",
				},
			],
			columns: [
				{ key: "date", label: "Data", align: "left", format: "date" },
				{
					key: "entradasRealizadas",
					label: "Ent. real.",
					align: "right",
					format: "money",
				},
				{
					key: "saidasRealizadas",
					label: "Sai. real.",
					align: "right",
					format: "money",
				},
				{
					key: "entradasPrevistas",
					label: "Ent. prev.",
					align: "right",
					format: "money",
				},
				{
					key: "saidasPrevistas",
					label: "Sai. prev.",
					align: "right",
					format: "money",
				},
				{
					key: "saldoAcumulado",
					label: "Saldo acum.",
					align: "right",
					format: "money",
				},
			],
			rows: dailySeries.map((s) => ({
				date: s.date,
				entradasRealizadas: s.entradasRealizadas,
				saidasRealizadas: s.saidasRealizadas,
				entradasPrevistas: s.entradasPrevistas,
				saidasPrevistas: s.saidasPrevistas,
				saldoAcumulado: s.saldoAcumulado,
			})),
			series,
		};
	}
}
