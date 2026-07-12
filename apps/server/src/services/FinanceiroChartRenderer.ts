import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { PdfTheme } from "./FinanceiroPdfTheme";

const PALETTE = [
	PdfTheme.colors.chartBlue,
	PdfTheme.colors.chartGreen,
	PdfTheme.colors.chartAmber,
	PdfTheme.colors.chartRed,
	PdfTheme.colors.chartGray,
	"#475569",
	"#78716C",
	"#0EA5E9",
];

export class FinanceiroChartRenderer {
	private canvas(width: number, height: number) {
		return new ChartJSNodeCanvas({
			width,
			height,
			backgroundColour: "#FFFFFF",
			chartCallback: (ChartJS) => {
				ChartJS.defaults.font.family = "Helvetica";
				ChartJS.defaults.color = PdfTheme.colors.muted;
				ChartJS.defaults.plugins.legend.labels.boxWidth = 10;
				ChartJS.defaults.plugins.legend.labels.font = { size: 10 };
			},
		});
	}

	async barGrouped(params: {
		labels: string[];
		datasets: Array<{ label: string; data: number[]; color?: string }>;
		width?: number;
		height?: number;
	}): Promise<Buffer> {
		const width = params.width ?? 520;
		const height = params.height ?? 220;
		const chart = this.canvas(width, height);
		return chart.renderToBuffer({
			type: "bar",
			data: {
				labels: params.labels,
				datasets: params.datasets.map((ds, i) => ({
					label: ds.label,
					data: ds.data,
					backgroundColor: ds.color ?? PALETTE[i % PALETTE.length],
					borderRadius: 4,
					maxBarThickness: 28,
				})),
			},
			options: {
				responsive: false,
				animation: false,
				plugins: {
					legend: { position: "bottom" },
					title: { display: false },
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { font: { size: 9 } },
					},
					y: {
						grid: { color: PdfTheme.colors.border },
						ticks: { font: { size: 9 } },
					},
				},
			},
		});
	}

	async line(params: {
		labels: string[];
		datasets: Array<{
			label: string;
			data: number[];
			color?: string;
			fill?: boolean;
		}>;
		width?: number;
		height?: number;
	}): Promise<Buffer> {
		const width = params.width ?? 520;
		const height = params.height ?? 220;
		const chart = this.canvas(width, height);
		return chart.renderToBuffer({
			type: "line",
			data: {
				labels: params.labels,
				datasets: params.datasets.map((ds, i) => {
					const color = ds.color ?? PALETTE[i % PALETTE.length] ?? "#64748B";
					return {
						label: ds.label,
						data: ds.data,
						borderColor: color,
						backgroundColor: ds.fill ? `${color}22` : color,
						fill: ds.fill ?? false,
						tension: 0.3,
						pointRadius: 2,
						borderWidth: 2,
					};
				}),
			},
			options: {
				responsive: false,
				animation: false,
				plugins: {
					legend: { position: "bottom" },
					title: { display: false },
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { font: { size: 9 }, maxRotation: 0 },
					},
					y: {
						grid: { color: PdfTheme.colors.border },
						ticks: { font: { size: 9 } },
					},
				},
			},
		});
	}

	async doughnut(params: {
		labels: string[];
		data: number[];
		colors?: string[];
		width?: number;
		height?: number;
	}): Promise<Buffer> {
		const width = params.width ?? 260;
		const height = params.height ?? 220;
		const chart = this.canvas(width, height);
		const colors =
			params.colors ??
			params.labels.map((_, i) => PALETTE[i % PALETTE.length] ?? "#64748B");
		return chart.renderToBuffer({
			type: "doughnut",
			data: {
				labels: params.labels,
				datasets: [
					{
						data: params.data,
						backgroundColor: colors,
						borderWidth: 0,
					},
				],
			},
			options: {
				responsive: false,
				animation: false,
				plugins: {
					legend: {
						position: "bottom",
						labels: { font: { size: 8 }, boxWidth: 8 },
					},
					title: { display: false },
				},
			},
		});
	}
}
