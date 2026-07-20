import PDFDocument from "pdfkit";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { BuildFinanceiroSaudeAnalysisService } from "./BuildFinanceiroSaudeAnalysisService";
import { ComputeFinanceiroSaudeScoreService } from "./ComputeFinanceiroSaudeScoreService";
import { FinanceiroChartRenderer } from "./FinanceiroChartRenderer";
import {
	FinanceiroPdfPrimitives as P,
	type PdfDoc,
} from "./FinanceiroPdfPrimitives";
import { PdfTheme, scoreTone } from "./FinanceiroPdfTheme";
import { formatDatePt, money } from "./financeiroReportShared";
import { GetFinanceiroDashboardService } from "./GetFinanceiroDashboardService";
import { GetFluxoCaixaReportService } from "./GetFluxoCaixaReportService";

type ReportEntry = Awaited<
	ReturnType<FinancialEntryRepository["listOpenEntriesForReport"]>
>[number];

type CostCenterRow = Awaited<
	ReturnType<FinancialEntryRepository["groupOpenByCostCenterAndKind"]>
>[number];

function partyName(entry: ReportEntry, kind: "receber" | "pagar") {
	return kind === "receber"
		? (entry.clientName ?? "—")
		: (entry.supplierName ?? "—");
}

function truncate(text: string, max: number) {
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1)}…`;
}

function monthPeriodLabel(now = new Date()) {
	const from = new Date(now.getFullYear(), now.getMonth(), 1);
	const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return `${formatDatePt(from)} a ${formatDatePt(to)}`;
}

function yearPeriodLabel(now = new Date()) {
	const year = now.getFullYear();
	return `${formatDatePt(new Date(year, 0, 1))} a ${formatDatePt(new Date(year, 11, 31))}`;
}

const MONTH_LABELS_PT = [
	"Jan",
	"Fev",
	"Mar",
	"Abr",
	"Mai",
	"Jun",
	"Jul",
	"Ago",
	"Set",
	"Out",
	"Nov",
	"Dez",
];

function monthLabelPt(isoMonth: string) {
	const monthIndex = Number(isoMonth.slice(5, 7)) - 1;
	return MONTH_LABELS_PT[monthIndex] ?? isoMonth.slice(5);
}

export class GenerateFinanceiroSaudePdfService {
	constructor(
		private readonly dashboardService = new GetFinanceiroDashboardService(),
		private readonly fluxoService = new GetFluxoCaixaReportService(),
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly companyRepository = new CompanyRepository(),
		private readonly scoreService = new ComputeFinanceiroSaudeScoreService(),
		private readonly analysisService = new BuildFinanceiroSaudeAnalysisService(),
		private readonly charts = new FinanceiroChartRenderer(),
	) {}

	async execute(companyId: string): Promise<Buffer> {
		const year = new Date().getFullYear();
		const yearFrom = `${year}-01-01`;
		const yearTo = `${year}-12-31`;

		const [dashboard, receber, pagar, porCentro, company, fluxo] =
			await Promise.all([
				this.dashboardService.execute(companyId),
				this.entryRepository.listOpenEntriesForReport(companyId, "receber"),
				this.entryRepository.listOpenEntriesForReport(companyId, "pagar"),
				this.entryRepository.groupOpenByCostCenterAndKind(companyId),
				this.companyRepository.findById(companyId),
				this.fluxoService.execute(companyId, { from: yearFrom, to: yearTo }),
			]);

		const companyName =
			company?.tradeName ?? company?.corporateName ?? "Empresa";
		const generatedAt = new Date();
		const { kpis } = dashboard;

		const openReceber = receber.reduce((s, e) => s + e.valorAberto, 0);
		const openPagar = pagar.reduce((s, e) => s + e.valorAberto, 0);

		const score = this.scoreService.execute({
			kpis,
			inadimplenciaSplit: dashboard.inadimplenciaSplit,
			openReceber,
			openPagar,
		});

		const analysis = this.analysisService.execute({
			kpis,
			porCategoria: dashboard.porCategoria,
			evolucaoMensal: dashboard.evolucaoMensal,
			score,
			openReceber,
			openPagar,
			receberCount: receber.length,
			pagarCount: pagar.length,
		});

		const [barChart, pieChart, lineChart, fluxoLine, fluxoBars] =
			await Promise.all([
				this.charts.barGrouped({
					labels: dashboard.receitasDespesas.map((r) => monthLabelPt(r.month)),
					datasets: [
						{
							label: "Receitas",
							data: dashboard.receitasDespesas.map((r) => r.receitas),
							color: PdfTheme.colors.chartGreen,
						},
						{
							label: "Despesas",
							data: dashboard.receitasDespesas.map((r) => r.despesas),
							color: PdfTheme.colors.chartRed,
						},
					],
					width: 300,
					height: 200,
				}),
				this.charts.doughnut({
					labels: dashboard.porCategoria.slice(0, 6).map((c) => c.name),
					data: dashboard.porCategoria.slice(0, 6).map((c) => c.valor),
					colors: dashboard.porCategoria.slice(0, 6).map((c) => c.cor),
					width: 220,
					height: 200,
				}),
				this.charts.line({
					labels: dashboard.evolucaoMensal.map((r) => monthLabelPt(r.month)),
					datasets: [
						{
							label: "Receita",
							data: dashboard.evolucaoMensal.map((r) => r.receita),
							color: PdfTheme.colors.chartGreen,
						},
						{
							label: "Despesa",
							data: dashboard.evolucaoMensal.map((r) => r.despesa),
							color: PdfTheme.colors.chartRed,
						},
						{
							label: "Lucro",
							data: dashboard.evolucaoMensal.map((r) => r.lucro),
							color: PdfTheme.colors.chartBlue,
						},
					],
					width: 520,
					height: 200,
				}),
				this.charts.line({
					labels:
						fluxo.series?.map((s) =>
							s.date.length === 7
								? monthLabelPt(s.date)
								: formatDatePt(s.date).slice(0, 5),
						) ?? [],
					datasets: [
						{
							label: "Saldo acumulado",
							data: fluxo.series?.map((s) => s.saldoAcumulado ?? 0) ?? [],
							color: PdfTheme.colors.chartBlue,
							fill: true,
						},
					],
					width: 520,
					height: 180,
				}),
				this.charts.barGrouped({
					labels:
						fluxo.series?.map((s) =>
							s.date.length === 7
								? monthLabelPt(s.date)
								: formatDatePt(s.date).slice(0, 5),
						) ?? [],
					datasets: [
						{
							label: "Entradas",
							data:
								fluxo.series?.map(
									(s) =>
										(s.entradasRealizadas ?? 0) + (s.entradasPrevistas ?? 0),
								) ?? [],
							color: PdfTheme.colors.chartGreen,
						},
						{
							label: "Saídas",
							data:
								fluxo.series?.map(
									(s) => (s.saidasRealizadas ?? 0) + (s.saidasPrevistas ?? 0),
								) ?? [],
							color: PdfTheme.colors.chartRed,
						},
					],
					width: 520,
					height: 180,
				}),
			]);

		const doc = new PDFDocument({
			size: "A4",
			margin: PdfTheme.margin,
			info: {
				Title: "Saúde financeira",
				Author: companyName,
			},
		});

		const chunks: Buffer[] = [];
		doc.on("data", (chunk: Buffer) => chunks.push(chunk));
		const done = new Promise<Buffer>((resolve, reject) => {
			doc.on("end", () => resolve(Buffer.concat(chunks)));
			doc.on("error", reject);
		});

		this.page1Cover(doc, {
			companyName,
			generatedAt,
			score,
			kpis,
		});

		doc.addPage();
		this.page2Charts(doc, {
			companyName,
			generatedAt,
			barChart,
			pieChart,
			lineChart,
			hasCategories: dashboard.porCategoria.length > 0,
		});

		doc.addPage();
		this.pageArAp(doc, {
			companyName,
			generatedAt,
			kind: "receber",
			entries: receber,
			kpis,
			openTotal: openReceber,
			porCentro: porCentro.filter((r) => r.kind === "receber"),
		});

		doc.addPage();
		this.pageArAp(doc, {
			companyName,
			generatedAt,
			kind: "pagar",
			entries: pagar,
			kpis,
			openTotal: openPagar,
			porCentro: porCentro.filter((r) => r.kind === "pagar"),
		});

		doc.addPage();
		this.page5Fluxo(doc, {
			companyName,
			generatedAt,
			fluxo,
			fluxoLine,
			fluxoBars,
		});

		doc.addPage();
		this.page6Analysis(doc, {
			companyName,
			generatedAt,
			analysis,
		});

		doc.addPage();
		this.pageFinal(doc, {
			companyName,
			generatedAt,
			score,
			analysis,
			kpis,
		});

		doc.end();
		return done;
	}

	private page1Cover(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			score: ReturnType<ComputeFinanceiroSaudeScoreService["execute"]>;
			kpis: Awaited<
				ReturnType<GetFinanceiroDashboardService["execute"]>
			>["kpis"];
		},
	) {
		const { companyName, generatedAt, score, kpis } = params;
		P.drawHeader(doc, {
			title: "Relatório de Saúde Financeira",
			companyName,
			periodLabel: monthPeriodLabel(generatedAt),
			generatedAt,
			subtitle: "Visão executiva do mês corrente",
		});

		const left = P.contentLeft(doc);
		const width = P.contentWidth(doc);
		const scoreW = width * 0.34;
		const scoreH = 130;
		const y0 = doc.y;

		P.drawScoreBlock(doc, {
			score: score.score,
			label: score.label,
			x: left,
			y: y0,
			width: scoreW,
			height: scoreH,
		});

		doc
			.font(PdfTheme.font.bold)
			.fontSize(PdfTheme.size.section)
			.fillColor(PdfTheme.colors.ink)
			.text("Resumo executivo", left + scoreW + 14, y0);

		doc
			.font(PdfTheme.font.regular)
			.fontSize(PdfTheme.size.caption)
			.fillColor(PdfTheme.colors.muted)
			.text(
				`Nota geral ${Math.round(score.score)}/100 (${score.label}). Indicadores do mês em cards ao lado e abaixo.`,
				left + scoreW + 14,
				doc.y + 4,
				{ width: width - scoreW - 14 },
			);

		doc.y = y0 + scoreH + 14;
		doc.x = left;

		P.drawKpiCards(doc, [
			{
				label: "Receita total",
				value: money(kpis.receitaLiquidaMes),
				tone: "positive",
			},
			{
				label: "Despesas",
				value: money(kpis.despesasMes),
				tone: "critical",
			},
			{
				label: "Lucro",
				value: money(kpis.lucroMes),
				tone: kpis.lucroMes >= 0 ? "positive" : "critical",
			},
			{
				label: "Margem",
				value: `${kpis.margemPercent}%`,
				tone: kpis.margemPercent >= 10 ? "positive" : "warning",
			},
			{
				label: "Saldo bancos",
				value: money(kpis.saldoEmBancos),
				tone: "neutral",
			},
		]);

		P.drawSectionTitle(doc, "Indicadores rápidos");
		P.drawProgressBars(
			doc,
			score.dimensions.map((d) => ({
				label: d.label,
				value: d.score,
				tone: scoreTone(d.score),
			})),
		);

		P.drawSectionTitle(doc, "Sinais do dia");
		P.drawKpiCards(
			doc,
			[
				{ label: "Receber hoje", value: money(kpis.contasReceberHoje) },
				{ label: "Recebido hoje", value: money(kpis.recebimentosHoje) },
				{ label: "Pagar hoje", value: money(kpis.contasPagarHoje) },
				{ label: "Pago hoje", value: money(kpis.pagamentosHoje) },
				{
					label: "Inadimplência",
					value: money(kpis.inadimplencia),
					tone: kpis.inadimplencia > 0 ? "critical" : "positive",
				},
				{ label: "Ticket médio", value: money(kpis.ticketMedio) },
			],
			{ columns: 3, cardHeight: 52 },
		);
	}

	private page2Charts(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			barChart: Buffer;
			pieChart: Buffer;
			lineChart: Buffer;
			hasCategories: boolean;
		},
	) {
		P.drawHeader(doc, {
			title: "Receitas, despesas e evolução",
			companyName: params.companyName,
			periodLabel: yearPeriodLabel(params.generatedAt),
			generatedAt: params.generatedAt,
		});

		const left = P.contentLeft(doc);
		const width = P.contentWidth(doc);
		P.drawSectionTitle(doc, "Receitas × Despesas");
		const yCharts = doc.y;
		P.drawImage(doc, params.barChart, left, yCharts, 300, 200);
		if (params.hasCategories) {
			doc
				.font(PdfTheme.font.bold)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.ink)
				.text("Por categoria", left + 310, yCharts);
			P.drawImage(doc, params.pieChart, left + 300, yCharts + 16, 210, 190);
		} else {
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.caption)
				.fillColor(PdfTheme.colors.muted)
				.text("Sem categorias para distribuição.", left + 310, yCharts + 40, {
					width: 200,
				});
		}
		doc.y = yCharts + 214;
		doc.x = left;

		P.drawSectionTitle(doc, "Evolução mensal");
		P.drawImage(doc, params.lineChart, left, doc.y, width, 200);
		doc.y += 214;
	}

	private pageArAp(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			kind: "receber" | "pagar";
			entries: ReportEntry[];
			kpis: Awaited<
				ReturnType<GetFinanceiroDashboardService["execute"]>
			>["kpis"];
			openTotal: number;
			porCentro: CostCenterRow[];
		},
	) {
		const isReceber = params.kind === "receber";
		const title = isReceber ? "Contas a receber" : "Contas a pagar";
		P.drawHeader(doc, {
			title,
			companyName: params.companyName,
			periodLabel: monthPeriodLabel(params.generatedAt),
			generatedAt: params.generatedAt,
		});

		const vencidas = params.entries.filter((e) => e.status === "vencido");
		const pendentes = params.entries.filter(
			(e) => e.status === "em_aberto" || e.status === "parcial",
		);
		const vencidasValor = vencidas.reduce((s, e) => s + e.valorAberto, 0);
		const pendentesValor = pendentes.reduce((s, e) => s + e.valorAberto, 0);

		const cards = isReceber
			? [
					{
						label: "Recebidas (mês)",
						value: money(params.kpis.recebimentosMes),
						tone: "positive" as const,
					},
					{
						label: "Pendentes",
						value: money(pendentesValor),
						tone: "warning" as const,
					},
					{
						label: "Vencidas",
						value: money(vencidasValor),
						tone:
							vencidasValor > 0 ? ("critical" as const) : ("neutral" as const),
					},
					{
						label: "Inadimplência",
						value: money(params.kpis.inadimplencia),
						tone:
							params.kpis.inadimplencia > 0
								? ("critical" as const)
								: ("positive" as const),
					},
				]
			: [
					{
						label: "Pagas (mês)",
						value: money(params.kpis.pagamentosMes),
						tone: "positive" as const,
					},
					{
						label: "Pendentes",
						value: money(pendentesValor),
						tone: "warning" as const,
					},
					{
						label: "Vencidas",
						value: money(vencidasValor),
						tone:
							vencidasValor > 0 ? ("critical" as const) : ("neutral" as const),
					},
					{
						label: "Em aberto",
						value: money(params.openTotal),
						tone: "neutral" as const,
					},
				];

		P.drawKpiCards(doc, cards, { columns: 4, cardHeight: 54 });

		doc
			.font(PdfTheme.font.regular)
			.fontSize(PdfTheme.size.caption)
			.fillColor(PdfTheme.colors.muted)
			.text(
				`${params.entries.length} título(s) em aberto · Total ${money(params.openTotal)}`,
			);
		doc.moveDown(0.6);

		const left = P.contentLeft(doc);
		const width = P.contentWidth(doc);
		const colW = (width - 16) / 3;
		const y0 = doc.y;

		const byCreated = [...params.entries].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		const byValor = [...params.entries].sort(
			(a, b) => b.valorAberto - a.valorAberto,
		);
		const byVenc = [...params.entries].sort(
			(a, b) =>
				new Date(a.dataVencimento).getTime() -
				new Date(b.dataVencimento).getTime(),
		);

		const toLines = (list: ReportEntry[]) =>
			list.slice(0, 5).map((e) => ({
				primary: truncate(partyName(e, params.kind), 22),
				secondary: `Venc. ${formatDatePt(e.dataVencimento)}`,
				value: money(e.valorAberto),
			}));

		const y1 = P.drawHighlightList(
			doc,
			"Últimas contas",
			toLines(byCreated),
			left,
			colW,
			y0,
		);
		const y2 = P.drawHighlightList(
			doc,
			"Maiores valores",
			toLines(byValor),
			left + colW + 8,
			colW,
			y0,
		);
		const y3 = P.drawHighlightList(
			doc,
			"Vencimentos próximos",
			toLines(byVenc),
			left + (colW + 8) * 2,
			colW,
			y0,
		);
		doc.y = Math.max(y1, y2, y3) + 8;
		doc.x = left;

		if (params.porCentro.length > 0) {
			P.drawSectionTitle(doc, "Por centro de custo");
			const top = [...params.porCentro]
				.sort((a, b) => b.valorAberto - a.valorAberto)
				.slice(0, 6);
			const maxVal = Math.max(...top.map((t) => t.valorAberto), 1);
			P.drawProgressBars(
				doc,
				top.map((t) => ({
					label: `${t.name} (${t.quantidade})`,
					value: t.valorAberto,
					max: maxVal,
					suffix: money(t.valorAberto),
					tone: "neutral" as const,
				})),
			);
		}
	}

	private page5Fluxo(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			fluxo: Awaited<ReturnType<GetFluxoCaixaReportService["execute"]>>;
			fluxoLine: Buffer;
			fluxoBars: Buffer;
		},
	) {
		P.drawHeader(doc, {
			title: "Fluxo de caixa",
			companyName: params.companyName,
			periodLabel: yearPeriodLabel(params.generatedAt),
			generatedAt: params.generatedAt,
		});

		P.drawKpiCards(
			doc,
			params.fluxo.kpis.map((k) => ({
				label: k.label,
				value:
					k.format === "percent"
						? `${k.value}%`
						: k.format === "number"
							? String(k.value)
							: money(k.value),
				tone: k.label.toLowerCase().includes("entrada")
					? ("positive" as const)
					: k.label.toLowerCase().includes("saída")
						? ("critical" as const)
						: ("neutral" as const),
			})),
			{ columns: 3, cardHeight: 54 },
		);

		const left = P.contentLeft(doc);
		const width = P.contentWidth(doc);

		P.drawSectionTitle(doc, "Saldo acumulado");
		P.drawImage(doc, params.fluxoLine, left, doc.y, width, 170);
		doc.y += 184;

		P.drawSectionTitle(doc, "Entradas × Saídas");
		P.drawImage(doc, params.fluxoBars, left, doc.y, width, 170);
		doc.y += 184;
	}

	private page6Analysis(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			analysis: ReturnType<BuildFinanceiroSaudeAnalysisService["execute"]>;
		},
	) {
		P.drawHeader(doc, {
			title: "Análise inteligente",
			companyName: params.companyName,
			periodLabel: monthPeriodLabel(params.generatedAt),
			generatedAt: params.generatedAt,
			subtitle: "Insights gerados a partir dos indicadores do período",
		});

		const a = params.analysis;
		const blocks = [
			{ title: "Pontos fortes", items: a.pontosFortes },
			{ title: "Oportunidades", items: a.oportunidades },
			{ title: "Riscos", items: a.riscos },
			{ title: "Sugestões", items: a.sugestoes },
		];

		for (const block of blocks) {
			P.drawSectionTitle(doc, block.title);
			P.drawCalloutCards(
				doc,
				block.items.map((i) => ({
					title: i.title,
					message: i.message,
					tone: i.tone,
				})),
				{ columns: 2 },
			);
		}
	}

	private pageFinal(
		doc: PdfDoc,
		params: {
			companyName: string;
			generatedAt: Date;
			score: ReturnType<ComputeFinanceiroSaudeScoreService["execute"]>;
			analysis: ReturnType<BuildFinanceiroSaudeAnalysisService["execute"]>;
			kpis: Awaited<
				ReturnType<GetFinanceiroDashboardService["execute"]>
			>["kpis"];
		},
	) {
		P.drawHeader(doc, {
			title: "Resumo executivo final",
			companyName: params.companyName,
			periodLabel: monthPeriodLabel(params.generatedAt),
			generatedAt: params.generatedAt,
		});

		const left = P.contentLeft(doc);
		const width = P.contentWidth(doc);
		const y0 = doc.y;

		P.drawScoreBlock(doc, {
			score: params.score.score,
			label: params.score.label,
			x: left,
			y: y0,
			width: width * 0.32,
			height: 120,
		});

		doc.y = y0;
		doc.x = left + width * 0.32 + 12;
		P.drawSectionTitle(doc, "Indicadores-chave");
		doc.x = left + width * 0.32 + 12;
		doc
			.font(PdfTheme.font.regular)
			.fontSize(PdfTheme.size.body)
			.fillColor(PdfTheme.colors.ink);
		const lines = [
			`Receita: ${money(params.kpis.receitaLiquidaMes)}`,
			`Despesas: ${money(params.kpis.despesasMes)}`,
			`Lucro: ${money(params.kpis.lucroMes)} (${params.kpis.margemPercent}%)`,
			`Saldo bancos: ${money(params.kpis.saldoEmBancos)}`,
			`Inadimplência: ${money(params.kpis.inadimplencia)}`,
			`Valor em aberto: ${money(params.kpis.valorEmAberto)}`,
		];
		for (const line of lines) {
			doc.text(line, left + width * 0.32 + 12, doc.y, {
				width: width * 0.65,
			});
		}

		doc.y = Math.max(doc.y, y0 + 130);
		doc.x = left;

		P.drawSectionTitle(doc, "Dimensões do score");
		P.drawProgressBars(
			doc,
			params.score.dimensions.map((d) => ({
				label: d.label,
				value: d.score,
				tone: scoreTone(d.score),
			})),
		);

		P.drawSectionTitle(doc, "Recomendações");
		P.drawCalloutCards(
			doc,
			params.analysis.sugestoes.map((s) => ({
				title: s.title,
				message: s.message,
				tone: s.tone,
			})),
			{ columns: 1 },
		);

		P.drawChecklist(doc, "Checklist", params.analysis.checklist);
		doc.moveDown(0.4);
		P.drawChecklist(doc, "Próximas ações", params.analysis.proximasAcoes);

		doc.moveDown(1);
		P.drawDivider(doc);
		doc
			.font(PdfTheme.font.regular)
			.fontSize(7)
			.fillColor(PdfTheme.colors.subtle)
			.text(
				"Relatório gerado automaticamente · Valores em Reais · Helios Labs",
				{ align: "center", width },
			);
	}
}
