import {
	createItrProcessSchema,
	listItrProcessesQuerySchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateItrProcessService } from "../services/CreateItrProcessService";
import { DownloadItrFileService } from "../services/DownloadItrFileService";
import { FindItrProcessService } from "../services/FindItrProcessService";
import { ListItrProcessesService } from "../services/ListItrProcessesService";
import { SoftDeleteItrFileService } from "../services/SoftDeleteItrFileService";
import { SoftDeleteItrProcessService } from "../services/SoftDeleteItrProcessService";
import { UploadItrFileService } from "../services/UploadItrFileService";
import { AppError } from "../utils/AppError";

export class ItrController {
	constructor(
		private readonly listService = new ListItrProcessesService(),
		private readonly findService = new FindItrProcessService(),
		private readonly createService = new CreateItrProcessService(),
		private readonly softDeleteService = new SoftDeleteItrProcessService(),
		private readonly uploadFileService = new UploadItrFileService(),
		private readonly softDeleteFileService = new SoftDeleteItrFileService(),
		private readonly downloadFileService = new DownloadItrFileService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listItrProcessesQuerySchema.parse(req.query);
			const result = await this.listService.execute(query, companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const id = String(req.params.id);
			const result = await this.findService.execute(id, companyId);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const userId = requireUserId(req);
			const body = parseCreateBody(req.body);
			const files = normalizeTypedFiles(req);
			const result = await this.createService.execute(body, files, {
				companyId,
				userId,
			});
			res.status(201).json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const userId = requireUserId(req);
			const id = String(req.params.id);
			const result = await this.softDeleteService.execute(id, {
				companyId,
				userId,
			});
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	uploadFile = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const userId = requireUserId(req);
			const processId = String(req.params.id);
			const file = req.file;
			if (!file) {
				throw new AppError(400, "Arquivo obrigatório.");
			}
			const result = await this.uploadFileService.execute(processId, file, {
				companyId,
				userId,
			});
			res.status(201).json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDeleteFile = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const processId = String(req.params.id);
			const fileId = String(req.params.fileId);
			const result = await this.softDeleteFileService.execute(
				processId,
				fileId,
				{ companyId },
			);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	downloadFile = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const processId = String(req.params.id);
			const fileId = String(req.params.fileId);
			const file = await this.downloadFileService.execute(processId, fileId, {
				companyId,
			});
			res.setHeader("Content-Type", file.mimeType);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${encodeURIComponent(file.originalName)}"`,
			);
			res.send(file.content);
		} catch (error) {
			handleError(res, error);
		}
	};
}

function parseCreateBody(body: unknown) {
	const raw =
		body && typeof body === "object" ? (body as Record<string, unknown>) : {};
	const normalized: Record<string, unknown> = { ...raw };
	if (typeof raw.valor === "string") {
		const digits = String(raw.valor).replace(/\D/g, "");
		normalized.valor = digits ? Number(digits) / 100 : Number.NaN;
	}
	if (typeof raw.document === "string") {
		normalized.document = raw.document.replace(/\D/g, "");
	}
	if (typeof raw.phone === "string") {
		normalized.phone = raw.phone.replace(/\D/g, "");
	}
	if (typeof raw.email === "string") {
		normalized.email = raw.email.trim().toLowerCase();
	}
	if (raw.clientId === "" || raw.clientId === "null") {
		normalized.clientId = null;
	}
	if (raw.observacoes === "") {
		normalized.observacoes = null;
	}
	return createItrProcessSchema.parse(normalized);
}

function normalizeTypedFiles(req: Request) {
	const bag = req.files as
		| Record<string, Express.Multer.File[]>
		| Express.Multer.File[]
		| undefined;

	if (!bag || Array.isArray(bag)) {
		return { declaracao: null, recibo: null, anexos: [] as Express.Multer.File[] };
	}

	return {
		declaracao: bag.declaracao?.[0] ?? null,
		recibo: bag.recibo?.[0] ?? null,
		anexos: bag.anexos ?? [],
	};
}

function requireCompanyId(req: Request) {
	const companyId = req.authSession?.user?.companyId;
	if (!companyId) {
		throw new AppError(403, "Empresa não vinculada.");
	}
	return companyId;
}

function requireUserId(req: Request) {
	const userId = req.authSession?.user?.id;
	if (!userId) {
		throw new AppError(401, "Não autenticado.");
	}
	return userId;
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
