import {
	adminSetPasswordSchema,
	changeOwnPasswordSchema,
	createUserSchema,
	listUsersQuerySchema,
	updateUserSchema,
} from "@sync_v2/contracts";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";
import { AdminSetUserPasswordService } from "../services/AdminSetUserPasswordService";
import { ChangeOwnPasswordService } from "../services/ChangeOwnPasswordService";
import { CreateUserService } from "../services/CreateUserService";
import { FindUserService } from "../services/FindUserService";
import { ListUsersService } from "../services/ListUsersService";
import { SoftDeleteUserService } from "../services/SoftDeleteUserService";
import { UpdateUserService } from "../services/UpdateUserService";
import type { ActorContext } from "../services/UserAccessRules";
import { AppError } from "../utils/AppError";

export class UserController {
	constructor(
		private readonly listUsersService = new ListUsersService(),
		private readonly findUserService = new FindUserService(),
		private readonly createUserService = new CreateUserService(),
		private readonly updateUserService = new UpdateUserService(),
		private readonly softDeleteUserService = new SoftDeleteUserService(),
		private readonly adminSetUserPasswordService = new AdminSetUserPasswordService(),
		private readonly changeOwnPasswordService = new ChangeOwnPasswordService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const query = listUsersQuerySchema.parse(req.query);
			const result = await this.listUsersService.execute(query, actor);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const id = String(req.params.id);
			const user = await this.findUserService.execute(id, actor);
			res.json(user);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const body = createUserSchema.parse(req.body);
			const user = await this.createUserService.execute(body, actor);
			res.status(201).json(user);
		} catch (error) {
			handleError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const id = String(req.params.id);
			const body = updateUserSchema.parse(req.body);
			const user = await this.updateUserService.execute(id, body, actor);
			res.json(user);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const id = String(req.params.id);
			const user = await this.softDeleteUserService.execute(id, actor);
			res.json(user);
		} catch (error) {
			handleError(res, error);
		}
	};

	adminSetPassword = async (req: Request, res: Response) => {
		try {
			const actor = requireActor(req);
			const id = String(req.params.id);
			const body = adminSetPasswordSchema.parse(req.body);
			const result = await this.adminSetUserPasswordService.execute(
				id,
				body,
				actor,
			);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	changeOwnPassword = async (req: Request, res: Response) => {
		try {
			const body = changeOwnPasswordSchema.parse(req.body);
			const headers = fromNodeHeaders(req.headers);
			const result = await this.changeOwnPasswordService.execute(body, headers);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function requireActor(req: Request): ActorContext {
	const sessionUser = req.authSession?.user;
	if (!sessionUser?.id) {
		throw new AppError(401, "Não autenticado.");
	}
	return {
		actorId: sessionUser.id,
		actorPerfil: sessionUser.perfil ?? "cliente",
		actorCompanyId: sessionUser.companyId,
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
