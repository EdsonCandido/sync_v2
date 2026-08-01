import {
	createAppointmentSchema,
	listAppointmentsQuerySchema,
	updateAppointmentSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateAppointmentService } from "../services/CreateAppointmentService";
import { FindAppointmentService } from "../services/FindAppointmentService";
import { ListAppointmentsService } from "../services/ListAppointmentsService";
import { SoftDeleteAppointmentService } from "../services/SoftDeleteAppointmentService";
import { UpdateAppointmentService } from "../services/UpdateAppointmentService";
import { AppError } from "../utils/AppError";

export class AppointmentController {
	constructor(
		private readonly listService = new ListAppointmentsService(),
		private readonly findService = new FindAppointmentService(),
		private readonly createService = new CreateAppointmentService(),
		private readonly updateService = new UpdateAppointmentService(),
		private readonly softDeleteService = new SoftDeleteAppointmentService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompany(req);
			const query = listAppointmentsQuerySchema.parse(req.query);
			res.json(await this.listService.execute(query, companyId));
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompany(req);
			res.json(
				await this.findService.execute(String(req.params.id), companyId),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompany(req);
			const body = createAppointmentSchema.parse(req.body);
			res.status(201).json(
				await this.createService.execute(body, {
					companyId,
					userId: req.authSession!.user.id,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompany(req);
			const body = updateAppointmentSchema.parse(req.body);
			res.json(
				await this.updateService.execute(String(req.params.id), body, {
					companyId,
					userId: req.authSession!.user.id,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompany(req);
			res.json(
				await this.softDeleteService.execute(String(req.params.id), {
					companyId,
					userId: req.authSession!.user.id,
				}),
			);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function requireCompany(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	if (!companyId) throw new AppError(403, "Empresa não vinculada.");
	return companyId;
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
