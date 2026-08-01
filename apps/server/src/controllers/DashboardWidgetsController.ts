import {
	createDashboardFavoriteSchema,
	createDashboardGoalSchema,
	updateDashboardFavoriteSchema,
	updateDashboardGoalSchema,
	updateDashboardWidgetLayoutSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import {
	CreateDashboardFavoriteService,
	CreateDashboardGoalService,
	GetDashboardWidgetsService,
	SoftDeleteDashboardFavoriteService,
	SoftDeleteDashboardGoalService,
	UpdateDashboardFavoriteService,
	UpdateDashboardGoalService,
	UpdateDashboardWidgetLayoutService,
} from "../services/DashboardWidgetsServices";
import { AppError } from "../utils/AppError";

export class DashboardWidgetsController {
	constructor(
		private readonly getService = new GetDashboardWidgetsService(),
		private readonly updateLayoutService = new UpdateDashboardWidgetLayoutService(),
		private readonly createFavoriteService = new CreateDashboardFavoriteService(),
		private readonly updateFavoriteService = new UpdateDashboardFavoriteService(),
		private readonly softDeleteFavoriteService = new SoftDeleteDashboardFavoriteService(),
		private readonly createGoalService = new CreateDashboardGoalService(),
		private readonly updateGoalService = new UpdateDashboardGoalService(),
		private readonly softDeleteGoalService = new SoftDeleteDashboardGoalService(),
	) {}

	get = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			res.json(await this.getService.execute({ companyId, userId }));
		} catch (error) {
			handleError(res, error);
		}
	};

	updateLayout = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			const body = updateDashboardWidgetLayoutSchema.parse(req.body);
			res.json(
				await this.updateLayoutService.execute(body, { companyId, userId }),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	createFavorite = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			const body = createDashboardFavoriteSchema.parse(req.body);
			res
				.status(201)
				.json(
					await this.createFavoriteService.execute(body, { companyId, userId }),
				);
		} catch (error) {
			handleError(res, error);
		}
	};

	updateFavorite = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			const body = updateDashboardFavoriteSchema.parse(req.body);
			res.json(
				await this.updateFavoriteService.execute(String(req.params.id), body, {
					companyId,
					userId,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteFavorite = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			res.json(
				await this.softDeleteFavoriteService.execute(String(req.params.id), {
					companyId,
					userId,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	createGoal = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			const body = createDashboardGoalSchema.parse(req.body);
			res
				.status(201)
				.json(
					await this.createGoalService.execute(body, { companyId, userId }),
				);
		} catch (error) {
			handleError(res, error);
		}
	};

	updateGoal = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			const body = updateDashboardGoalSchema.parse(req.body);
			res.json(
				await this.updateGoalService.execute(String(req.params.id), body, {
					companyId,
					userId,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteGoal = async (req: Request, res: Response) => {
		try {
			const { companyId, userId } = requireCtx(req);
			res.json(
				await this.softDeleteGoalService.execute(String(req.params.id), {
					companyId,
					userId,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function requireCtx(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	const userId = req.authSession?.user?.id;
	if (!userId) throw new AppError(401, "Não autenticado.");
	if (!companyId) throw new AppError(403, "Empresa não vinculada.");
	return { companyId, userId };
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
		res.status(400).json({ message: "Dados inválidos." });
		return;
	}
	console.error(error);
	res.status(500).json({ message: "Erro interno." });
}
