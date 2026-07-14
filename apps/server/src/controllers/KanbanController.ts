import {
	addKanbanObservationSchema,
	createKanbanBoardSchema,
	createKanbanCardSchema,
	createKanbanChecklistItemSchema,
	createKanbanColumnSchema,
	listKanbanBoardQuerySchema,
	moveKanbanCardSchema,
	updateKanbanBoardSchema,
	updateKanbanCardSchema,
	updateKanbanChecklistItemSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { AddKanbanCardObservationService } from "../services/AddKanbanCardObservationService";
import { CreateKanbanBoardService } from "../services/CreateKanbanBoardService";
import { CreateKanbanCardService } from "../services/CreateKanbanCardService";
import { CreateKanbanChecklistItemService } from "../services/CreateKanbanChecklistItemService";
import { CreateKanbanColumnService } from "../services/CreateKanbanColumnService";
import { DownloadKanbanAttachmentService } from "../services/DownloadKanbanAttachmentService";
import { FindKanbanCardService } from "../services/FindKanbanCardService";
import { GetKanbanBoardService } from "../services/GetKanbanBoardService";
import { ListKanbanBoardsService } from "../services/ListKanbanBoardsService";
import { ListKanbanFilterOptionsService } from "../services/ListKanbanFilterOptionsService";
import { MoveKanbanCardService } from "../services/MoveKanbanCardService";
import { SoftDeleteKanbanAttachmentService } from "../services/SoftDeleteKanbanAttachmentService";
import { SoftDeleteKanbanBoardService } from "../services/SoftDeleteKanbanBoardService";
import { SoftDeleteKanbanCardService } from "../services/SoftDeleteKanbanCardService";
import { SoftDeleteKanbanChecklistItemService } from "../services/SoftDeleteKanbanChecklistItemService";
import { SoftDeleteKanbanColumnService } from "../services/SoftDeleteKanbanColumnService";
import { UpdateKanbanBoardService } from "../services/UpdateKanbanBoardService";
import { UpdateKanbanCardService } from "../services/UpdateKanbanCardService";
import { UpdateKanbanChecklistItemService } from "../services/UpdateKanbanChecklistItemService";
import { UploadKanbanAttachmentService } from "../services/UploadKanbanAttachmentService";
import { AppError } from "../utils/AppError";

export class KanbanController {
	constructor(
		private readonly listBoardsService = new ListKanbanBoardsService(),
		private readonly createBoardService = new CreateKanbanBoardService(),
		private readonly updateBoardService = new UpdateKanbanBoardService(),
		private readonly softDeleteBoardService = new SoftDeleteKanbanBoardService(),
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
		private readonly uploadAttachmentService = new UploadKanbanAttachmentService(),
		private readonly downloadAttachmentService = new DownloadKanbanAttachmentService(),
		private readonly softDeleteAttachmentService = new SoftDeleteKanbanAttachmentService(),
	) {}

	listBoards = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const result = await this.listBoardsService.execute(ctx);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	createBoard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const body = createKanbanBoardSchema.parse(req.body);
			const board = await this.createBoardService.execute(body, ctx);
			res.status(201).json(board);
		} catch (error) {
			handleError(res, error);
		}
	};

	updateBoard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const boardId = String(req.params.boardId);
			const body = updateKanbanBoardSchema.parse(req.body);
			const board = await this.updateBoardService.execute(boardId, body, ctx);
			res.json(board);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteBoard = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const boardId = String(req.params.boardId);
			const board = await this.softDeleteBoardService.execute(boardId, ctx);
			res.json(board);
		} catch (error) {
			handleError(res, error);
		}
	};

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
			const ctx = requireCompanyContext(req);
			const body = createKanbanColumnSchema.parse(req.body);
			const column = await this.createColumnService.execute(body, ctx);
			res.status(201).json(column);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteColumn = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const id = String(req.params.columnId);
			const column = await this.softDeleteColumnService.execute(id, ctx);
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

	uploadAttachment = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const file = req.file;
			if (!file) {
				throw new AppError(400, "Arquivo obrigatório.");
			}
			const attachment = await this.uploadAttachmentService.execute(
				cardId,
				file,
				ctx,
			);
			res.status(201).json(attachment);
		} catch (error) {
			handleError(res, error);
		}
	};

	downloadAttachment = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const attachmentId = String(req.params.attachmentId);
			const file = await this.downloadAttachmentService.execute(
				cardId,
				attachmentId,
				ctx,
			);
			const encodedName = encodeURIComponent(file.originalName);
			const asciiName = file.originalName.replace(/[^\x20-\x7E]/g, "_");
			res.setHeader("Content-Type", file.mimeType);
			res.setHeader("Content-Length", String(file.sizeBytes));
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
			);
			res.send(file.content);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteAttachment = async (req: Request, res: Response) => {
		try {
			const ctx = requireCompanyContext(req);
			const cardId = String(req.params.cardId);
			const attachmentId = String(req.params.attachmentId);
			const attachment = await this.softDeleteAttachmentService.execute(
				cardId,
				attachmentId,
				ctx,
			);
			res.json(attachment);
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
		(error as { name: string }).name === "MulterError"
	) {
		const code = (error as { code?: string }).code;
		if (code === "LIMIT_FILE_SIZE") {
			res.status(400).json({ message: "Arquivo excede o limite de 10 MB." });
			return;
		}
		res.status(400).json({ message: "Falha no upload do arquivo." });
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
