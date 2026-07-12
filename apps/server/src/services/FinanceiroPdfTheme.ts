/** Tokens visuais compartilhados dos PDFs financeiros (apresentação apenas). */

export const PdfTheme = {
	margin: 40,
	pageWidth: 595.28,
	pageHeight: 841.89,
	contentWidth: 515.28,

	colors: {
		ink: "#0F172A",
		muted: "#64748B",
		subtle: "#94A3B8",
		border: "#E2E8F0",
		cardBg: "#F8FAFC",
		white: "#FFFFFF",
		positive: "#16A34A",
		warning: "#CA8A04",
		critical: "#DC2626",
		neutral: "#64748B",
		accent: "#0F172A",
		track: "#E2E8F0",
		zebra: "#F1F5F9",
		chartBlue: "#334155",
		chartGreen: "#16A34A",
		chartRed: "#DC2626",
		chartAmber: "#CA8A04",
		chartGray: "#94A3B8",
	},

	font: {
		regular: "Helvetica",
		bold: "Helvetica-Bold",
	},

	size: {
		title: 18,
		section: 12,
		body: 9,
		caption: 8,
		kpiValue: 13,
		score: 42,
	},
} as const;

export type PdfTone = "positive" | "warning" | "critical" | "neutral" | "info";

export function toneColor(tone: PdfTone): string {
	switch (tone) {
		case "positive":
			return PdfTheme.colors.positive;
		case "warning":
			return PdfTheme.colors.warning;
		case "critical":
			return PdfTheme.colors.critical;
		case "info":
			return PdfTheme.colors.chartBlue;
		default:
			return PdfTheme.colors.neutral;
	}
}

export function scoreTone(score: number): PdfTone {
	if (score >= 80) return "positive";
	if (score >= 60) return "info";
	if (score >= 40) return "warning";
	return "critical";
}
