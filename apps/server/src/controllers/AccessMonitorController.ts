import { listLoginAccessHistoryQuerySchema } from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { ListActiveSessionsService } from "../services/ListActiveSessionsService";
import { ListLoginAccessHistoryService } from "../services/ListLoginAccessHistoryService";
import { AppError } from "../utils/AppError";

export class AccessMonitorController {
	constructor(
		private readonly listActiveSessionsService = new ListActiveSessionsService(),
		private readonly listLoginAccessHistoryService = new ListLoginAccessHistoryService(),
	) {}

	listSessions = async (_req: Request, res: Response) => {
		try {
			const result = await this.listActiveSessionsService.execute();
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	listHistory = async (req: Request, res: Response) => {
		try {
			const query = listLoginAccessHistoryQuerySchema.parse(req.query);
			const result = await this.listLoginAccessHistoryService.execute(query);
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
