import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
	FinanceiroReportSlug,
} from "@sync_v2/contracts";

export type ReportDateRange = {
	from: Date;
	to: Date;
	fromIso: string;
	toIso: string;
};

export function defaultYearRange(now = new Date()): ReportDateRange {
	const year = now.getFullYear();
	const from = new Date(year, 0, 1);
	const to = new Date(year, 11, 31);
	return toRange(from, to);
}

export function resolveReportRange(
	query: FinanceiroReportQuery,
	now = new Date(),
): ReportDateRange {
	const fallback = defaultYearRange(now);
	const from = query.from ? parseIsoDate(query.from) : fallback.from;
	const to = query.to ? parseIsoDate(query.to) : fallback.to;
	if (from > to) {
		return toRange(to, from);
	}
	return toRange(from, to);
}

export function parseIsoDate(iso: string): Date {
	const parts = iso.split("-").map(Number);
	const y = parts[0] ?? 1970;
	const m = parts[1] ?? 1;
	const d = parts[2] ?? 1;
	return new Date(y, m - 1, d);
}

export function toIsoDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function toRange(from: Date, to: Date): ReportDateRange {
	return {
		from,
		to,
		fromIso: toIsoDate(from),
		toIso: toIsoDate(to),
	};
}

export function eachDayIso(from: Date, to: Date): string[] {
	const days: string[] = [];
	const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
	while (cursor <= end) {
		days.push(toIsoDate(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}
	return days;
}

export function isSameCalendarMonth(from: Date, to: Date): boolean {
	return (
		from.getFullYear() === to.getFullYear() &&
		from.getMonth() === to.getMonth()
	);
}

export function toIsoMonth(d: Date | string): string {
	if (typeof d === "string") {
		return d.length >= 7 ? d.slice(0, 7) : d;
	}
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

export function formatDatePt(value: Date | string | null | undefined): string {
	if (!value) return "—";
	const d = typeof value === "string" ? new Date(value) : value;
	return d.toLocaleDateString("pt-BR");
}

export function money(value: number): string {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function statusLabel(status: string): string {
	const map: Record<string, string> = {
		em_aberto: "Em aberto",
		parcial: "Parcial",
		vencido: "Vencido",
		pago: "Pago",
		cancelado: "Cancelado",
	};
	return map[status] ?? status;
}

export function reportMeta(
	slug: FinanceiroReportSlug,
	title: string,
	range: ReportDateRange,
): FinanceiroReportResponse["meta"] {
	return {
		slug,
		title,
		from: range.fromIso,
		to: range.toIso,
	};
}

export const REPORT_TITLES: Record<FinanceiroReportSlug, string> = {
	geral: "Financeiro Geral",
	"fluxo-caixa": "Fluxo de Caixa",
	"receitas-periodo": "Receitas por período",
	"despesas-periodo": "Despesas por período",
	"receitas-cliente": "Receitas por Cliente",
	"despesas-categoria": "Despesas por Categoria",
	"centro-custo": "Centro de Custo",
	inadimplencia: "Inadimplência",
	"clientes-devedores": "Clientes Devedores",
	"pagamentos-banco": "Pagamentos por Banco",
	"recebimentos-banco": "Recebimentos por Banco",
	extrato: "Extrato Financeiro",
};
