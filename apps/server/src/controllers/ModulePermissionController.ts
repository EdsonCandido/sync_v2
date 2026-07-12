import { upsertUserModulePermissionsSchema } from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { GetMyModulesService } from "../services/GetMyModulesService";
import { ListCompanyUserPermissionsService } from "../services/ListCompanyUserPermissionsService";
import { UpsertUserModulePermissionService } from "../services/UpsertUserModulePermissionService";
import { AppError } from "../utils/AppError";

export class ModulePermissionController {
	constructor(
		private readonly getMyModulesService = new GetMyModulesService(),
		private readonly listCompanyUserPermissionsService = new ListCompanyUserPermissionsService(),
		private readonly upsertUserModulePermissionService = new UpsertUserModulePermissionService(),
	) {}

	me = async (req: Request, res: Response) => {
		try {
			const user = req.authSession!.user;
			const result = await this.getMyModulesService.execute({
				userId: user.id,
				perfil: user.perfil,
				companyId: user.companyId,
			});
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	listUsers = async (req: Request, res: Response) => {
		try {
			const companyId = req.authSession!.user.companyId;
			if (!companyId) {
				throw new AppError(403, "Empresa não vinculada.");
			}
			const result =
				await this.listCompanyUserPermissionsService.execute(companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	upsertUser = async (req: Request, res: Response) => {
		try {
			const companyId = req.authSession!.user.companyId;
			if (!companyId) {
				throw new AppError(403, "Empresa não vinculada.");
			}
			const targetUserId = String(req.params.userId);
			const body = upsertUserModulePermissionsSchema.parse(req.body);
			const result = await this.upsertUserModulePermissionService.execute({
				targetUserId,
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
