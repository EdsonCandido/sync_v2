import {
	createClientSchema,
	listClientsQuerySchema,
	updateClientSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateClientService } from "../services/CreateClientService";
import { FindClientService } from "../services/FindClientService";
import { ListClientsService } from "../services/ListClientsService";
import { SoftDeleteClientService } from "../services/SoftDeleteClientService";
import { UpdateClientService } from "../services/UpdateClientService";
import { AppError } from "../utils/AppError";

export class ClientController {
	constructor(
		private readonly listClientsService = new ListClientsService(),
		private readonly findClientService = new FindClientService(),
		private readonly createClientService = new CreateClientService(),
		private readonly updateClientService = new UpdateClientService(),
		private readonly softDeleteClientService = new SoftDeleteClientService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listClientsQuerySchema.parse(req.query);
			const result = await this.listClientsService.execute(query, companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const id = String(req.params.id);
			const client = await this.findClientService.execute(id, companyId);
			res.json(client);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = createClientSchema.parse(req.body);
			const userId = req.authSession!.user.id;
			const client = await this.createClientService.execute(body, {
				companyId,
				userId,
			});
			res.status(201).json(client);
		} catch (error) {
			handleError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const id = String(req.params.id);
			const body = updateClientSchema.parse(req.body);
			const userId = req.authSession!.user.id;
			const client = await this.updateClientService.execute(id, body, {
				companyId,
				userId,
			});
			res.json(client);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const id = String(req.params.id);
			const userId = req.authSession!.user.id;
			const client = await this.softDeleteClientService.execute(
				id,
				companyId,
				userId,
			);
			res.json(client);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function requireCompanyId(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	if (!companyId) {
		throw new AppError(403, "Empresa não vinculada.");
	}
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
		res.status(400).json({ message: "Dados inválidos.", issues: error });
		return;
	}
	console.error(error);
	res.status(500).json({ message: "Erro interno." });
}
