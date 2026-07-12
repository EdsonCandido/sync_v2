import type { Request, Response } from "express";
import { GetFinanceiroDashboardService } from "../services/GetFinanceiroDashboardService";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

export class FinanceiroDashboardController {
	constructor(
		private readonly dashboardService = new GetFinanceiroDashboardService(),
	) {}

	get = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(await this.dashboardService.execute(companyId));
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};
}
