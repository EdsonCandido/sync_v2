import {
	createPlanSchema,
	listPlansQuerySchema,
	updatePlanSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreatePlanService } from "../services/CreatePlanService";
import { FindPlanService } from "../services/FindPlanService";
import { ListPlanOptionsService } from "../services/ListPlanOptionsService";
import { ListPlansService } from "../services/ListPlansService";
import { SoftDeletePlanService } from "../services/SoftDeletePlanService";
import { UpdatePlanService } from "../services/UpdatePlanService";
import { AppError } from "../utils/AppError";

export class PlanController {
	constructor(
		private readonly listPlansService = new ListPlansService(),
		private readonly listPlanOptionsService = new ListPlanOptionsService(),
		private readonly findPlanService = new FindPlanService(),
		private readonly createPlanService = new CreatePlanService(),
		private readonly updatePlanService = new UpdatePlanService(),
		private readonly softDeletePlanService = new SoftDeletePlanService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const query = listPlansQuerySchema.parse(req.query);
			const result = await this.listPlansService.execute(query);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	options = async (_req: Request, res: Response) => {
		try {
			const plans = await this.listPlanOptionsService.execute();
			res.json(plans);
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const plan = await this.findPlanService.execute(id);
			res.json(plan);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const body = createPlanSchema.parse(req.body);
			const plan = await this.createPlanService.execute(body);
			res.status(201).json(plan);
		} catch (error) {
			handleError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const body = updatePlanSchema.parse(req.body);
			const plan = await this.updatePlanService.execute(id, body);
			res.json(plan);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const plan = await this.softDeletePlanService.execute(id);
			res.json(plan);
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
