import type { Request, Response } from "express";
import { ListNotificationsService } from "../services/ListNotificationsService";
import { MarkAllNotificationsReadService } from "../services/MarkAllNotificationsReadService";
import { MarkNotificationReadService } from "../services/MarkNotificationReadService";
import { AppError } from "../utils/AppError";

export class NotificationController {
	constructor(
		private readonly listService = new ListNotificationsService(),
		private readonly markReadService = new MarkNotificationReadService(),
		private readonly markAllReadService = new MarkAllNotificationsReadService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const userId = req.authSession!.user.id;
			const companyId = req.authSession!.user.companyId ?? null;
			res.json(await this.listService.execute({ userId, companyId }));
		} catch (error) {
			handleError(res, error);
		}
	};

	markRead = async (req: Request, res: Response) => {
		try {
			res.json(
				await this.markReadService.execute(
					String(req.params.id),
					req.authSession!.user.id,
				),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	markAllRead = async (req: Request, res: Response) => {
		try {
			res.json(await this.markAllReadService.execute(req.authSession!.user.id));
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
