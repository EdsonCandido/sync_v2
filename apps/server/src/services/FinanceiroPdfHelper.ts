import type { FinanceiroReportResponse } from "@sync_v2/contracts";
import PDFDocument from "pdfkit";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { FinanceiroChartRenderer } from "./FinanceiroChartRenderer";
import {
	type CompactColumn,
	FinanceiroPdfPrimitives as P,
	type PdfDoc,
} from "./FinanceiroPdfPrimitives";
import { PdfTheme } from "./FinanceiroPdfTheme";
import { formatDatePt, money } from "./financeiroReportShared";

type PdfColumn = FinanceiroReportResponse["columns"][number];

export class FinanceiroPdfHelper {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly charts = new FinanceiroChartRenderer(),
	) {}

	async render(params: {
		companyId: string;
		report: FinanceiroReportResponse;
	}): Promise<Buffer> {
		const company = await this.companyRepository.findById(params.companyId);
		const companyName =
			company?.tradeName ?? company?.corporateName ?? "Empresa";
		const { report } = params;
		const generatedAt = new Date();

		const seriesChart = await this.buildSeriesChart(report);
		const agingMax =
			report.aging && report.aging.length > 0
				? Math.max(...report.aging.map((a) => a.valor), 1)
				: 1;

		const doc = new PDFDocument({
			size: "A4",
			margin: PdfTheme.margin,
			info: {
				Title: report.meta.title,
				Author: companyName,
			},
		});

		const chunks: Buffer[] = [];
		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		const done = new Promise<Buffer>((resolve, reject) => {
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);
		});

		P.drawHeader(doc, {
			title: report.meta.title,
			companyName,
			periodLabel: `${formatDatePt(report.meta.from)} a ${formatDatePt(report.meta.to)}`,
			generatedAt,
		});

		if (report.bankAccountLabel) {
			P.drawKpiCards(
				doc,
				[
					{ label: "Conta", value: report.bankAccountLabel, tone: "neutral" },
					...(report.saldoInicial !== undefined
						? [
								{
									label: "Saldo inicial",
									value: money(report.saldoInicial),
									tone: "neutral" as const,
								},
							]
						: []),
					...(report.saldoFinal !== undefined
						? [
								{
									label: "Saldo final",
									value: money(report.saldoFinal),
									tone:
										report.saldoFinal >= 0
											? ("positive" as const)
											: ("critical" as const),
								},
							]
						: []),
				],
				{ columns: 3, cardHeight: 52 },
			);
		}

		if (report.kpis.length > 0) {
			P.drawSectionTitle(doc, "Indicadores");
			P.drawKpiCards(
				doc,
				report.kpis.map((kpi) => ({
					label: kpi.label,
					value: this.formatKpi(kpi.value, kpi.format),
					tone: this.kpiTone(kpi.label, kpi.value),
				})),
				{
					columns: Math.min(report.kpis.length, 4),
					cardHeight: 54,
				},
			);
		}

		if (report.aging && report.aging.length > 0) {
			const agingBuckets = report.aging;
			P.drawSectionTitle(doc, "Aging");
			P.drawProgressBars(
				doc,
				agingBuckets.map((bucket, idx) => ({
					label: `${bucket.bucket} · ${bucket.quantidade} título(s)`,
					value: bucket.valor,
					max: agingMax,
					suffix: money(bucket.valor),
					tone:
						idx === 0
							? ("positive" as const)
							: idx >= agingBuckets.length - 1
								? ("critical" as const)
								: ("warning" as const),
				})),
			);
		}

		if (seriesChart) {
			P.drawSectionTitle(doc, "Evolução no período");
			const left = P.contentLeft(doc);
			const width = P.contentWidth(doc);
			P.ensureSpace(doc, 200);
			P.drawImage(doc, seriesChart, left, doc.y, width, 180);
			doc.y += 194;
			doc.x = left;
		}

		if (report.rows.length > 0) {
			P.drawSectionTitle(doc, "Detalhe");
			this.writeCompactTable(doc, report.columns, report.rows);
		} else if (!report.series?.length) {
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.muted)
				.text("Sem registros no período.");
		}

		doc.end();
		return done;
	}

	private formatKpi(
		value: number,
		format: "money" | "number" | "percent",
	): string {
		if (format === "number") return String(value);
		if (format === "percent") return `${value}%`;
		return money(value);
	}

	private kpiTone(
		label: string,
		value: number,
	): "positive" | "critical" | "warning" | "neutral" {
		const l = label.toLowerCase();
		if (l.includes("lucro") || l.includes("entrada") || l.includes("receb")) {
			return value >= 0 ? "positive" : "critical";
		}
		if (l.includes("saída") || l.includes("despesa") || l.includes("pago")) {
			return "critical";
		}
		if (l.includes("vencid") || l.includes("inadimpl")) {
			return value > 0 ? "critical" : "positive";
		}
		return "neutral";
	}

	private async buildSeriesChart(
		report: FinanceiroReportResponse,
	): Promise<Buffer | null> {
		const series = report.series;
		if (!series || series.length === 0) return null;

		const hasSaldo = series.some((s) => s.saldoAcumulado !== undefined);
		const hasEntradas = series.some(
			(s) =>
				s.entradasRealizadas !== undefined || s.entradasPrevistas !== undefined,
		);
		const hasReceitas = series.some((s) => s.receitas !== undefined);

		const step = Math.max(1, Math.ceil(series.length / 16));
		const sampled = series.filter((_, i) => i % step === 0);
		const labels = sampled.map((s) => formatDatePt(s.date).slice(0, 5));

		if (hasSaldo && hasEntradas) {
			return this.charts.line({
				labels,
				datasets: [
					{
						label: "Saldo acumulado",
						data: sampled.map((s) => s.saldoAcumulado ?? 0),
						color: PdfTheme.colors.chartBlue,
						fill: true,
					},
					{
						label: "Entradas",
						data: sampled.map(
							(s) => (s.entradasRealizadas ?? 0) + (s.entradasPrevistas ?? 0),
						),
						color: PdfTheme.colors.chartGreen,
					},
					{
						label: "Saídas",
						data: sampled.map(
							(s) => (s.saidasRealizadas ?? 0) + (s.saidasPrevistas ?? 0),
						),
						color: PdfTheme.colors.chartRed,
					},
				],
				width: 520,
				height: 200,
			});
		}

		if (hasReceitas) {
			return this.charts.barGrouped({
				labels,
				datasets: [
					{
						label: "Receitas",
						data: sampled.map((s) => s.receitas ?? 0),
						color: PdfTheme.colors.chartGreen,
					},
					{
						label: "Despesas",
						data: sampled.map((s) => s.despesas ?? 0),
						color: PdfTheme.colors.chartRed,
					},
				],
				width: 520,
				height: 200,
			});
		}

		const keys = Object.keys(series[0] ?? {}).filter((k) => k !== "date");
		if (keys.length === 0) return null;

		return this.charts.line({
			labels,
			datasets: keys.slice(0, 3).map((key, i) => ({
				label: key,
				data: sampled.map((s) =>
					Number((s as Record<string, unknown>)[key] ?? 0),
				),
				color: [
					PdfTheme.colors.chartBlue,
					PdfTheme.colors.chartGreen,
					PdfTheme.colors.chartAmber,
				][i],
			})),
			width: 520,
			height: 200,
		});
	}

	private writeCompactTable(
		doc: PdfDoc,
		columns: PdfColumn[],
		rows: Array<Record<string, string | number | null>>,
	) {
		const compact: CompactColumn[] = columns.map((col) => ({
			key: col.key,
			label: col.label,
			align: col.align,
			format: (raw) => this.formatCell(raw, col.format),
		}));
		P.drawCompactTable(doc, compact, rows);
	}

	private formatCell(
		raw: string | number | null | undefined,
		format: PdfColumn["format"],
	): string {
		if (raw === null || raw === undefined || raw === "") return "—";
		if (format === "money") return money(Number(raw));
		if (format === "number") return String(raw);
		if (format === "date") return formatDatePt(String(raw));
		return String(raw);
	}
}
