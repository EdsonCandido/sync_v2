import {
	addKanbanObservationSchema,
	createKanbanCardSchema,
	createKanbanChecklistItemSchema,
	createKanbanColumnSchema,
	listKanbanBoardQuerySchema,
	moveKanbanCardSchema,
	updateKanbanCardSchema,
	updateKanbanChecklistItemSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { AddKanbanCardObservationService } from "../services/AddKanbanCardObservationService";
import { CreateKanbanCardService } from "../services/CreateKanbanCardService";
import { CreateKanbanChecklistItemService } from "../services/CreateKanbanChecklistItemService";
import { CreateKanbanColumnService } from "../services/CreateKanbanColumnService";
import { FindKanbanCardService } from "../services/FindKanbanCardService";
import { GetKanbanBoardService } from "../services/GetKanbanBoardService";
import { ListKanbanFilterOptionsService } from "../services/ListKanbanFilterOptionsService";
import { MoveKanbanCardService } from "../services/MoveKanbanCardService";
import { SoftDeleteKanbanCardService } from "../services/SoftDeleteKanbanCardService";
import { SoftDeleteKanbanChecklistItemService } from "../services/SoftDeleteKanbanChecklistItemService";
import { SoftDeleteKanbanColumnService } from "../services/SoftDeleteKanbanColumnService";
import { UpdateKanbanCardService } from "../services/UpdateKanbanCardService";
import { UpdateKanbanChecklistItemService } from "../services/UpdateKanbanChecklistItemService";
import { AppError } from "../utils/AppError";

export class KanbanController {
	constructor(
		private readonly getBoardService = new GetKanbanBoardService(),
		private readonly listFilterOptionsService = new ListKanbanFilterOptionsService(),
		private readonly createColumnService = new CreateKanbanColumnService(),
		private readonly softDeleteColumnService = new SoftDeleteKanbanColumnService(),
		private readonly createCardService = new CreateKanbanCardService(),
		private readonly findCardService = new FindKanbanCardService(),
		private readonly updateCardService = new UpdateKanbanCardService(),
		private readonly moveCardService = new MoveKanbanCardService(),
		private readonly softDeleteCardService = new SoftDeleteKanbanCardService(),
		private readonly createChecklistService = new CreateKanbanChecklistItemService(),
		private readonly updateChecklistService = new UpdateKanbanChecklistItemService(),
		private readonly softDeleteChecklistService = new SoftDeleteKanbanChecklistItemService(),
		private readonly addObservationService = new AddKanbanCardObservationService(),
	) {}

	getBoard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const query = listKanbanBoardQuerySchema.parse(req.query);
			const board = await this.getBoardService.execute(query, ctx);
			res.json(board);
		} catch (error) {
			handleError(res, error);
		}
	};

	listFilterOptions = async (req: Request, res: Response) => {
		try {
			const { companyId } = requireCompanyContext(req);
			const options = await this.listFilterOptionsService.execute(companyId);
			res.json(options);
		} catch (error) {
			handleError(res, error);
		}
	};

	createColumn = async (req: Request, res: Response) => {
		try {
			const { companyId } = requireCompanyContext(req);
			const body = createKanbanColumnSchema.parse(req.body);
			const column = await this.createColumnService.execute(body, companyId);
			res.status(201).json(column);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteColumn = async (req: Request, res: Response) => {
		try {
			const { companyId } = requireCompanyContext(req);
			const id = String(req.params.columnId);
			const column = await this.softDeleteColumnService.execute(id, companyId);
			res.json(column);
		} catch (error) {
			handleError(res, error);
		}
	};

	createCard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const body = createKanbanCardSchema.parse(req.body);
			const card = await this.createCardService.execute(body, {
				companyId: ctx.companyId,
				userId: ctx.userId,
				perfil: ctx.perfil,
			});
			res.status(201).json(card);
		} catch (error) {
			handleError(res, error);
		}
	};

	findCard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const id = String(req.params.cardId);
			const card = await this.findCardService.execute(id, ctx);
			res.json(card);
		} catch (error) {
			handleError(res, error);
		}
	};

	updateCard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const id = String(req.params.cardId);
			const body = updateKanbanCardSchema.parse(req.body);
			const card = await this.updateCardService.execute(id, body, ctx);
			res.json(card);
		} catch (error) {
			handleError(res, error);
		}
	};

	moveCard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const id = String(req.params.cardId);
			const body = moveKanbanCardSchema.parse(req.body);
			const card = await this.moveCardService.execute(id, body, ctx);
			res.json(card);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteCard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const id = String(req.params.cardId);
			const card = await this.softDeleteCardService.execute(id, ctx);
			res.json(card);
		} catch (error) {
			handleError(res, error);
		}
	};

	createChecklistItem = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const body = createKanbanChecklistItemSchema.parse(req.body);
			const item = await this.createChecklistService.execute(cardId, body, ctx);
			res.status(201).json(item);
		} catch (error) {
			handleError(res, error);
		}
	};

	updateChecklistItem = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const itemId = String(req.params.itemId);
			const body = updateKanbanChecklistItemSchema.parse(req.body);
			const item = await this.updateChecklistService.execute(
				cardId,
				itemId,
				body,
				ctx,
			);
			res.json(item);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteChecklistItem = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const itemId = String(req.params.itemId);
			const item = await this.softDeleteChecklistService.execute(
				cardId,
				itemId,
				ctx,
			);
			res.json(item);
		} catch (error) {
			handleError(res, error);
		}
	};

	addObservation = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const body = addKanbanObservationSchema.parse(req.body);
			const entry = await this.addObservationService.execute(cardId, body, ctx);
			res.status(201).json(entry);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function requireCompanyContext(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	const userId = req.authSession?.user?.id;
	const perfil = req.authSession?.user?.perfil ?? "cliente";
	if (!companyId || !userId) {
		throw new AppError(403, "Empresa não vinculada.");
	}
	return { companyId, userId, perfil };
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
