import type { Request, Response } from "express";
import { GetCompanyDashboardService } from "../services/GetCompanyDashboardService";
import { AppError } from "../utils/AppError";

export class CompanyDashboardController {
	constructor(
		private readonly getCompanyDashboardService = new GetCompanyDashboardService(),
	) {}

	get = async (req: Request, res: Response) => {
		try {
			const companyId = req.authSession!.user.companyId;
			if (!companyId) {
				res.status(403).json({ message: "Empresa não vinculada." });
				return;
			}
			const result = await this.getCompanyDashboardService.execute(companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function handleError(res: Response, error: unknown) {
	if (error instanceof AppError) {
		res.status(error.status).json({ message: error.message });
		return;
	}
	console.error(error);
	res.status(500).json({ message: "Erro interno." });
}
