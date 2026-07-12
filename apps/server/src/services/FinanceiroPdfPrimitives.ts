import type PDFDocument from "pdfkit";
import {
	PdfTheme,
	type PdfTone,
	scoreTone,
	toneColor,
} from "./FinanceiroPdfTheme";

export type PdfDoc = InstanceType<typeof PDFDocument>;

export type KpiCardItem = {
	label: string;
	value: string;
	tone?: PdfTone;
};

export type ProgressItem = {
	label: string;
	value: number;
	max?: number;
	suffix?: string;
	tone?: PdfTone;
};

export type CalloutItem = {
	title: string;
	message: string;
	tone?: PdfTone;
};

export type CompactColumn = {
	key: string;
	label: string;
	align?: "left" | "right";
	width?: number;
	format?: (raw: string | number | null | undefined) => string;
};

export class FinanceiroPdfPrimitives {
	static ensureSpace(doc: PdfDoc, needed: number) {
		if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
			doc.addPage();
		}
	}

	static contentLeft(doc: PdfDoc) {
		return doc.page.margins.left;
	}

	static contentWidth(doc: PdfDoc) {
		return doc.page.width - doc.page.margins.left - doc.page.margins.right;
	}

	static drawDivider(doc: PdfDoc, y?: number) {
		const lineY = y ?? doc.y;
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const right = left + FinanceiroPdfPrimitives.contentWidth(doc);
		doc
			.moveTo(left, lineY)
			.lineTo(right, lineY)
			.strokeColor(PdfTheme.colors.border)
			.lineWidth(0.8)
			.stroke()
			.lineWidth(1)
			.strokeColor(PdfTheme.colors.ink);
		doc.y = lineY + 10;
		doc.x = left;
	}

	static drawHeader(
		doc: PdfDoc,
		params: {
			title: string;
			companyName: string;
			periodLabel?: string;
			generatedAt: Date;
			subtitle?: string;
		},
	) {
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const width = FinanceiroPdfPrimitives.contentWidth(doc);

		doc
			.rect(left, 28, 4, 36)
			.fill(PdfTheme.colors.accent)
			.fillColor(PdfTheme.colors.ink);

		doc
			.font(PdfTheme.font.bold)
			.fontSize(PdfTheme.size.title)
			.fillColor(PdfTheme.colors.ink)
			.text(params.title, left + 14, 28, { width: width - 14 });

		doc
			.font(PdfTheme.font.regular)
			.fontSize(PdfTheme.size.body)
			.fillColor(PdfTheme.colors.muted)
			.text(params.companyName, left + 14, doc.y + 2, { width: width - 14 });

		if (params.periodLabel) {
			doc.text(`Período: ${params.periodLabel}`, { width: width - 14 });
		}
		if (params.subtitle) {
			doc.text(params.subtitle, { width: width - 14 });
		}
		doc.text(`Gerado em ${params.generatedAt.toLocaleString("pt-BR")}`, {
			width: width - 14,
		});

		doc.y += 8;
		FinanceiroPdfPrimitives.drawDivider(doc);
		doc.fillColor(PdfTheme.colors.ink);
	}

	static drawSectionTitle(doc: PdfDoc, title: string) {
		FinanceiroPdfPrimitives.ensureSpace(doc, 28);
		doc
			.font(PdfTheme.font.bold)
			.fontSize(PdfTheme.size.section)
			.fillColor(PdfTheme.colors.ink)
			.text(title, FinanceiroPdfPrimitives.contentLeft(doc), doc.y, {
				width: FinanceiroPdfPrimitives.contentWidth(doc),
			});
		doc.moveDown(0.35);
	}

	static drawBadge(
		doc: PdfDoc,
		label: string,
		tone: PdfTone,
		x: number,
		y: number,
	) {
		const paddingX = 8;
		const paddingY = 3;
		doc.font(PdfTheme.font.bold).fontSize(8);
		const textW = doc.widthOfString(label);
		const w = textW + paddingX * 2;
		const h = 16;
		const color = toneColor(tone);
		doc.roundedRect(x, y, w, h, 8).fillOpacity(0.12).fill(color).fillOpacity(1);
		doc.fillColor(color).text(label, x + paddingX, y + paddingY, {
			width: textW,
			lineBreak: false,
		});
		doc.fillColor(PdfTheme.colors.ink);
		return { width: w, height: h };
	}

	static drawScoreBlock(
		doc: PdfDoc,
		params: {
			score: number;
			label: string;
			x: number;
			y: number;
			width: number;
			height: number;
		},
	) {
		const tone = scoreTone(params.score);
		const color = toneColor(tone);
		doc
			.roundedRect(params.x, params.y, params.width, params.height, 10)
			.fillAndStroke(PdfTheme.colors.cardBg, PdfTheme.colors.border);

		doc
			.font(PdfTheme.font.regular)
			.fontSize(PdfTheme.size.caption)
			.fillColor(PdfTheme.colors.muted)
			.text("Saúde financeira", params.x + 16, params.y + 16, {
				width: params.width - 32,
			});

		doc
			.font(PdfTheme.font.bold)
			.fontSize(PdfTheme.size.score)
			.fillColor(color)
			.text(`${Math.round(params.score)}`, params.x + 16, params.y + 34, {
				width: params.width - 32,
				continued: true,
			})
			.fontSize(14)
			.fillColor(PdfTheme.colors.muted)
			.text("/100");

		FinanceiroPdfPrimitives.drawBadge(
			doc,
			params.label,
			tone,
			params.x + 16,
			params.y + params.height - 34,
		);
		doc.fillColor(PdfTheme.colors.ink);
	}

	static drawKpiCards(
		doc: PdfDoc,
		items: KpiCardItem[],
		params?: { columns?: number; cardHeight?: number },
	) {
		const columns = params?.columns ?? Math.min(items.length, 5);
		const cardHeight = params?.cardHeight ?? 58;
		const gap = 8;
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const totalW = FinanceiroPdfPrimitives.contentWidth(doc);
		const cardW = (totalW - gap * (columns - 1)) / columns;

		FinanceiroPdfPrimitives.ensureSpace(doc, cardHeight + 8);
		const startY = doc.y;
		let col = 0;
		let rowY = startY;

		for (const item of items) {
			if (col >= columns) {
				col = 0;
				rowY += cardHeight + gap;
				FinanceiroPdfPrimitives.ensureSpace(doc, cardHeight + 8);
				if (doc.y < 60) {
					rowY = doc.y;
				}
			}
			const x = left + col * (cardW + gap);
			const tone = item.tone ?? "neutral";
			doc
				.roundedRect(x, rowY, cardW, cardHeight, 8)
				.fillAndStroke(PdfTheme.colors.cardBg, PdfTheme.colors.border);
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.caption)
				.fillColor(PdfTheme.colors.muted)
				.text(item.label, x + 10, rowY + 10, {
					width: cardW - 20,
					lineBreak: false,
				});
			doc
				.font(PdfTheme.font.bold)
				.fontSize(PdfTheme.size.kpiValue)
				.fillColor(toneColor(tone))
				.text(item.value, x + 10, rowY + 28, {
					width: cardW - 20,
					lineBreak: false,
				});
			col += 1;
		}

		const rows = Math.ceil(items.length / columns);
		doc.y = rowY + cardHeight + 12;
		doc.x = left;
		doc.fillColor(PdfTheme.colors.ink);
		return rows;
	}

	static drawProgressBars(doc: PdfDoc, items: ProgressItem[]) {
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const width = FinanceiroPdfPrimitives.contentWidth(doc);
		const barH = 8;
		const rowH = 34;

		for (const item of items) {
			FinanceiroPdfPrimitives.ensureSpace(doc, rowH);
			const max = item.max ?? 100;
			const ratio = Math.max(0, Math.min(1, item.value / Math.max(max, 1)));
			const tone = item.tone ?? scoreTone(ratio * 100);
			const y = doc.y;

			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.ink)
				.text(item.label, left, y, { width: width * 0.55, lineBreak: false });
			doc
				.font(PdfTheme.font.bold)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.muted)
				.text(
					item.suffix ??
						`${Math.round(item.value)}${max === 100 ? "/100" : ""}`,
					left,
					y,
					{ width, align: "right", lineBreak: false },
				);

			const barY = y + 16;
			doc.roundedRect(left, barY, width, barH, 4).fill(PdfTheme.colors.track);
			if (ratio > 0) {
				doc
					.roundedRect(left, barY, Math.max(4, width * ratio), barH, 4)
					.fill(toneColor(tone));
			}
			doc.y = barY + barH + 10;
			doc.x = left;
		}
		doc.fillColor(PdfTheme.colors.ink);
	}

	static drawCalloutCards(
		doc: PdfDoc,
		items: CalloutItem[],
		params?: { columns?: number },
	) {
		const columns = params?.columns ?? 2;
		const gap = 10;
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const totalW = FinanceiroPdfPrimitives.contentWidth(doc);
		const cardW = (totalW - gap * (columns - 1)) / columns;
		const minH = 78;

		let col = 0;
		let rowY = doc.y;
		let rowMaxH = 0;

		for (const item of items) {
			if (col >= columns) {
				col = 0;
				rowY += rowMaxH + gap;
				rowMaxH = 0;
			}

			doc.font(PdfTheme.font.regular).fontSize(PdfTheme.size.body);
			const msgH = doc.heightOfString(item.message, {
				width: cardW - 24,
			});
			const cardH = Math.max(minH, 40 + msgH);
			FinanceiroPdfPrimitives.ensureSpace(doc, cardH + 8);
			if (doc.y < 60 && col === 0) {
				rowY = doc.y;
			}

			const x = left + col * (cardW + gap);
			const tone = item.tone ?? "neutral";
			const color = toneColor(tone);

			doc
				.roundedRect(x, rowY, cardW, cardH, 8)
				.fillAndStroke(PdfTheme.colors.cardBg, PdfTheme.colors.border);
			doc.rect(x, rowY, 4, cardH).fill(color);

			doc
				.font(PdfTheme.font.bold)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.ink)
				.text(item.title, x + 14, rowY + 12, {
					width: cardW - 24,
				});
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.caption)
				.fillColor(PdfTheme.colors.muted)
				.text(item.message, x + 14, rowY + 30, {
					width: cardW - 24,
				});

			rowMaxH = Math.max(rowMaxH, cardH);
			col += 1;
		}

		doc.y = rowY + rowMaxH + 12;
		doc.x = left;
		doc.fillColor(PdfTheme.colors.ink);
	}

	static drawHighlightList(
		doc: PdfDoc,
		title: string,
		lines: Array<{ primary: string; secondary?: string; value?: string }>,
		x: number,
		width: number,
		startY: number,
	) {
		let y = startY;
		doc
			.font(PdfTheme.font.bold)
			.fontSize(PdfTheme.size.body)
			.fillColor(PdfTheme.colors.ink)
			.text(title, x, y, { width });
		y = doc.y + 4;

		if (lines.length === 0) {
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.caption)
				.fillColor(PdfTheme.colors.muted)
				.text("Sem itens.", x, y, { width });
			return doc.y + 8;
		}

		for (const line of lines) {
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.caption)
				.fillColor(PdfTheme.colors.ink)
				.text(line.primary, x, y, {
					width: width * 0.62,
					lineBreak: false,
				});
			if (line.value) {
				doc
					.font(PdfTheme.font.bold)
					.fillColor(PdfTheme.colors.ink)
					.text(line.value, x, y, {
						width,
						align: "right",
						lineBreak: false,
					});
			}
			y += 12;
			if (line.secondary) {
				doc
					.font(PdfTheme.font.regular)
					.fontSize(7)
					.fillColor(PdfTheme.colors.subtle)
					.text(line.secondary, x, y, { width, lineBreak: false });
				y += 11;
			}
		}
		return y + 6;
	}

	static drawImage(
		doc: PdfDoc,
		png: Buffer,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		doc.image(png, x, y, { width, height });
	}

	static drawCompactTable(
		doc: PdfDoc,
		columns: CompactColumn[],
		rows: Array<Record<string, string | number | null>>,
	) {
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		const totalW = FinanceiroPdfPrimitives.contentWidth(doc);
		const fixed = columns.reduce((s, c) => s + (c.width ?? 0), 0);
		const flexCount = columns.filter((c) => !c.width).length;
		const flexW =
			flexCount > 0 ? (totalW - fixed) / flexCount : totalW / columns.length;
		const widths = columns.map((c) => c.width ?? flexW);

		const drawHeader = () => {
			const y = doc.y;
			doc.rect(left, y, totalW, 18).fill(PdfTheme.colors.zebra);
			doc.font(PdfTheme.font.bold).fontSize(7).fillColor(PdfTheme.colors.muted);
			let x = left;
			columns.forEach((col, i) => {
				const w = widths[i] ?? flexW;
				doc.text(col.label, x + 3, y + 5, {
					width: w - 6,
					align: col.align === "right" ? "right" : "left",
					lineBreak: false,
				});
				x += w;
			});
			doc.y = y + 22;
			doc.x = left;
			doc.fillColor(PdfTheme.colors.ink);
			doc.font(PdfTheme.font.regular);
		};

		const ensure = () => {
			if (doc.y + 16 > doc.page.height - doc.page.margins.bottom) {
				doc.addPage();
				drawHeader();
			}
		};

		drawHeader();

		rows.forEach((row, idx) => {
			ensure();
			const y = doc.y;
			if (idx % 2 === 1) {
				doc.rect(left, y - 2, totalW, 14).fill(PdfTheme.colors.cardBg);
			}
			let x = left;
			let maxH = 12;
			doc
				.font(PdfTheme.font.regular)
				.fontSize(7)
				.fillColor(PdfTheme.colors.ink);
			columns.forEach((col, i) => {
				const w = widths[i] ?? flexW;
				const raw = row[col.key];
				const text = col.format
					? col.format(raw)
					: raw === null || raw === undefined || raw === ""
						? "—"
						: String(raw);
				const h = doc.heightOfString(text, { width: w - 6 });
				maxH = Math.max(maxH, Math.min(h, 24));
				doc.text(text, x + 3, y, {
					width: w - 6,
					align: col.align === "right" ? "right" : "left",
					lineBreak: false,
				});
				x += w;
			});
			doc.x = left;
			doc.y = y + maxH + 2;
		});
	}

	static drawChecklist(doc: PdfDoc, title: string, items: string[]) {
		FinanceiroPdfPrimitives.drawSectionTitle(doc, title);
		const left = FinanceiroPdfPrimitives.contentLeft(doc);
		for (const item of items) {
			FinanceiroPdfPrimitives.ensureSpace(doc, 16);
			const y = doc.y;
			doc
				.roundedRect(left, y + 1, 8, 8, 2)
				.strokeColor(PdfTheme.colors.border)
				.stroke();
			doc
				.font(PdfTheme.font.regular)
				.fontSize(PdfTheme.size.body)
				.fillColor(PdfTheme.colors.ink)
				.text(item, left + 14, y, {
					width: FinanceiroPdfPrimitives.contentWidth(doc) - 14,
				});
			doc.y = Math.max(doc.y, y + 14);
			doc.x = left;
		}
	}
}
