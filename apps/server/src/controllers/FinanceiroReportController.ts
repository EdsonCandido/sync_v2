import type {
	FinanceiroReportQuery,
	FinanceiroReportResponse,
	FinanceiroReportSlug,
} from "@sync_v2/contracts";
import {
	financeiroReportQuerySchema,
	financeiroReportSlugSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { REPORT_TITLES } from "../services/financeiroReportShared";
import { GenerateCentroCustoPdfService } from "../services/GenerateCentroCustoPdfService";
import { GenerateClientesDevedoresPdfService } from "../services/GenerateClientesDevedoresPdfService";
import { GenerateDespesasCategoriaPdfService } from "../services/GenerateDespesasCategoriaPdfService";
import { GenerateDespesasPeriodoPdfService } from "../services/GenerateDespesasPeriodoPdfService";
import { GenerateExtratoFinanceiroPdfService } from "../services/GenerateExtratoFinanceiroPdfService";
import { GenerateFinanceiroGeralPdfService } from "../services/GenerateFinanceiroGeralPdfService";
import { GenerateFinanceiroSaudePdfService } from "../services/GenerateFinanceiroSaudePdfService";
import { GenerateFluxoCaixaPdfService } from "../services/GenerateFluxoCaixaPdfService";
import { GenerateInadimplenciaPdfService } from "../services/GenerateInadimplenciaPdfService";
import { GeneratePagamentosBancoPdfService } from "../services/GeneratePagamentosBancoPdfService";
import { GenerateRecebimentosBancoPdfService } from "../services/GenerateRecebimentosBancoPdfService";
import { GenerateReceitasClientePdfService } from "../services/GenerateReceitasClientePdfService";
import { GenerateReceitasPeriodoPdfService } from "../services/GenerateReceitasPeriodoPdfService";
import { GetCentroCustoReportService } from "../services/GetCentroCustoReportService";
import { GetClientesDevedoresReportService } from "../services/GetClientesDevedoresReportService";
import { GetDespesasCategoriaReportService } from "../services/GetDespesasCategoriaReportService";
import { GetDespesasPeriodoReportService } from "../services/GetDespesasPeriodoReportService";
import { GetExtratoFinanceiroReportService } from "../services/GetExtratoFinanceiroReportService";
import { GetFinanceiroGeralReportService } from "../services/GetFinanceiroGeralReportService";
import { GetFluxoCaixaReportService } from "../services/GetFluxoCaixaReportService";
import { GetInadimplenciaReportService } from "../services/GetInadimplenciaReportService";
import { GetPagamentosBancoReportService } from "../services/GetPagamentosBancoReportService";
import { GetRecebimentosBancoReportService } from "../services/GetRecebimentosBancoReportService";
import { GetReceitasClienteReportService } from "../services/GetReceitasClienteReportService";
import { GetReceitasPeriodoReportService } from "../services/GetReceitasPeriodoReportService";
import { AppError } from "../utils/AppError";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

type ReportRunner = {
	get: (
		companyId: string,
		query: FinanceiroReportQuery,
	) => Promise<FinanceiroReportResponse>;
	pdf: (companyId: string, query: FinanceiroReportQuery) => Promise<Buffer>;
};

export class FinanceiroReportController {
	private readonly saudePdfService = new GenerateFinanceiroSaudePdfService();
	private readonly runners: Record<FinanceiroReportSlug, ReportRunner>;

	constructor() {
		const geralGet = new GetFinanceiroGeralReportService();
		const geralPdf = new GenerateFinanceiroGeralPdfService();
		const receitasGet = new GetReceitasPeriodoReportService();
		const receitasPdf = new GenerateReceitasPeriodoPdfService();
		const despesasGet = new GetDespesasPeriodoReportService();
		const despesasPdf = new GenerateDespesasPeriodoPdfService();
		const fluxoGet = new GetFluxoCaixaReportService();
		const fluxoPdf = new GenerateFluxoCaixaPdfService();
		const extratoGet = new GetExtratoFinanceiroReportService();
		const extratoPdf = new GenerateExtratoFinanceiroPdfService();
		const receitasClienteGet = new GetReceitasClienteReportService();
		const receitasClientePdf = new GenerateReceitasClientePdfService();
		const despesasCatGet = new GetDespesasCategoriaReportService();
		const despesasCatPdf = new GenerateDespesasCategoriaPdfService();
		const centroGet = new GetCentroCustoReportService();
		const centroPdf = new GenerateCentroCustoPdfService();
		const pagBancoGet = new GetPagamentosBancoReportService();
		const pagBancoPdf = new GeneratePagamentosBancoPdfService();
		const recBancoGet = new GetRecebimentosBancoReportService();
		const recBancoPdf = new GenerateRecebimentosBancoPdfService();
		const inadGet = new GetInadimplenciaReportService();
		const inadPdf = new GenerateInadimplenciaPdfService();
		const devedoresGet = new GetClientesDevedoresReportService();
		const devedoresPdf = new GenerateClientesDevedoresPdfService();

		this.runners = {
			geral: {
				get: (c, q) => geralGet.execute(c, q),
				pdf: (c, q) => geralPdf.execute(c, q),
			},
			"fluxo-caixa": {
				get: (c, q) => fluxoGet.execute(c, q),
				pdf: (c, q) => fluxoPdf.execute(c, q),
			},
			"receitas-periodo": {
				get: (c, q) => receitasGet.execute(c, q),
				pdf: (c, q) => receitasPdf.execute(c, q),
			},
			"despesas-periodo": {
				get: (c, q) => despesasGet.execute(c, q),
				pdf: (c, q) => despesasPdf.execute(c, q),
			},
			"receitas-cliente": {
				get: (c, q) => receitasClienteGet.execute(c, q),
				pdf: (c, q) => receitasClientePdf.execute(c, q),
			},
			"despesas-categoria": {
				get: (c, q) => despesasCatGet.execute(c, q),
				pdf: (c, q) => despesasCatPdf.execute(c, q),
			},
			"centro-custo": {
				get: (c, q) => centroGet.execute(c, q),
				pdf: (c, q) => centroPdf.execute(c, q),
			},
			inadimplencia: {
				get: (c, q) => inadGet.execute(c, q),
				pdf: (c, q) => inadPdf.execute(c, q),
			},
			"clientes-devedores": {
				get: (c, q) => devedoresGet.execute(c, q),
				pdf: (c, q) => devedoresPdf.execute(c, q),
			},
			"pagamentos-banco": {
				get: (c, q) => pagBancoGet.execute(c, q),
				pdf: (c, q) => pagBancoPdf.execute(c, q),
			},
			"recebimentos-banco": {
				get: (c, q) => recBancoGet.execute(c, q),
				pdf: (c, q) => recBancoPdf.execute(c, q),
			},
			extrato: {
				get: (c, q) => extratoGet.execute(c, q),
				pdf: (c, q) => extratoPdf.execute(c, q),
			},
		};
	}

	saudeFinanceiraPdf = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const buffer = await this.saudePdfService.execute(companyId);
			const date = new Date().toISOString().slice(0, 10);
			const filename = `saude-financeira-${date}.pdf`;
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
			);
			res.send(buffer);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	get = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const slug = this.parseSlug(req.params.slug);
			const query = financeiroReportQuerySchema.parse(req.query);
			const report = await this.runners[slug].get(companyId, query);
			res.json(report);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	pdf = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const slug = this.parseSlug(req.params.slug);
			const query = financeiroReportQuerySchema.parse(req.query);
			const buffer = await this.runners[slug].pdf(companyId, query);
			const date = new Date().toISOString().slice(0, 10);
			const filename = `${slug}-${date}.pdf`;
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
			);
			res.send(buffer);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	list = async (_req: Request, res: Response) => {
		try {
			const items = (Object.keys(REPORT_TITLES) as FinanceiroReportSlug[]).map(
				(slug) => ({
					slug,
					title: REPORT_TITLES[slug],
				}),
			);
			res.json({ items });
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	private parseSlug(value: unknown): FinanceiroReportSlug {
		const parsed = financeiroReportSlugSchema.safeParse(value);
		if (!parsed.success) {
			throw new AppError(404, "Relatório não encontrado.");
		}
		return parsed.data;
	}
}
