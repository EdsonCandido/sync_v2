import { upsertCompanyModulesSchema } from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { GetCompanyModulesService } from "../services/GetCompanyModulesService";
import { UpsertCompanyModulesService } from "../services/UpsertCompanyModulesService";
import { AppError } from "../utils/AppError";

export class CompanyModulePermissionController {
	constructor(
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
		private readonly upsertCompanyModulesService = new UpsertCompanyModulesService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = String(req.params.companyId);
			const result = await this.getCompanyModulesService.execute(companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	upsert = async (req: Request, res: Response) => {
		try {
			const companyId = String(req.params.companyId);
			const body = upsertCompanyModulesSchema.parse(req.body);
			const result = await this.upsertCompanyModulesService.execute({
				companyId,
				input: body,
				actorUserId: req.authSession!.user.id,
			});
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
	if (
		error &&
		typeof error === "object" &&
		"name" in error &&
		(error as { name: string }).name === "ZodError"
	) {
		res.status(400).json({ message: "Dados inválidos.", issues: error });
		return;
	}
	console.error(error);
	res.status(500).json({ message: "Erro interno." });
}
