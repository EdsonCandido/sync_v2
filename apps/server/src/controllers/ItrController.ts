import {
	createItrProcessSchema,
	itrClientByDocumentParamSchema,
	listItrProcessesQuerySchema,
	updateItrProcessSchema,
	uploadItrFileSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateItrProcessService } from "../services/CreateItrProcessService";
import { DownloadItrFileService } from "../services/DownloadItrFileService";
import { FindItrClientByDocumentService } from "../services/FindItrClientByDocumentService";
import { FindItrProcessService } from "../services/FindItrProcessService";
import { ListItrProcessesService } from "../services/ListItrProcessesService";
import { SoftDeleteItrFileService } from "../services/SoftDeleteItrFileService";
import { SoftDeleteItrProcessService } from "../services/SoftDeleteItrProcessService";
import { UpdateItrProcessService } from "../services/UpdateItrProcessService";
import { UploadItrFileService } from "../services/UploadItrFileService";
import { AppError } from "../utils/AppError";

export class ItrController {
	constructor(
		private readonly listService = new ListItrProcessesService(),
		private readonly findService = new FindItrProcessService(),
		private readonly findClientByDocumentService = new FindItrClientByDocumentService(),
		private readonly createService = new CreateItrProcessService(),
		private readonly updateService = new UpdateItrProcessService(),
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

	findClientByDocument = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const { document } = itrClientByDocumentParamSchema.parse({
				document: String(req.params.document ?? ""),
			});
			const result = await this.findClientByDocumentService.execute(
				document,
				companyId,
			);
			res.json({ client: result });
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

	update = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const userId = requireUserId(req);
			const id = String(req.params.id);
			const body = parseUpdateBody(req.body);
			const result = await this.updateService.execute(id, body, {
				companyId,
				userId,
			});
			res.json(result);
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
			const kindRaw =
				typeof req.body?.kind === "string"
					? req.body.kind
					: typeof req.query.kind === "string"
						? req.query.kind
						: "anexo";
			const { kind } = uploadItrFileSchema.parse({ kind: kindRaw });
			const result = await this.uploadFileService.execute(processId, file, {
				companyId,
				userId,
				kind,
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

/** Reais já numéricos (`30` / `"30"` / `"30.00"`). Máscara BRL (`R$ 30,00`) vira dígitos/100. */
function parseItrValor(raw: unknown): number {
	if (typeof raw === "number") return raw;
	if (typeof raw !== "string") return Number.NaN;
	const trimmed = raw.trim();
	if (!trimmed) return Number.NaN;
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	const digits = trimmed.replace(/\D/g, "");
	return digits ? Number(digits) / 100 : Number.NaN;
}

function parseCreateBody(body: unknown) {
	const raw =
		body && typeof body === "object" ? (body as Record<string, unknown>) : {};
	const normalized: Record<string, unknown> = { ...raw };
	if (raw.valor !== undefined) {
		normalized.valor = parseItrValor(raw.valor);
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
	if (
		typeof raw.dataVencimento === "string" &&
		/^\d{4}-\d{2}-\d{2}$/.test(raw.dataVencimento)
	) {
		normalized.dataVencimento = `${raw.dataVencimento}T12:00:00`;
	}
	return createItrProcessSchema.parse(normalized);
}

function parseUpdateBody(body: unknown) {
	const raw =
		body && typeof body === "object" ? (body as Record<string, unknown>) : {};
	const normalized: Record<string, unknown> = { ...raw };
	if (raw.observacoes === "") {
		normalized.observacoes = null;
	}
	return updateItrProcessSchema.parse(normalized);
}

function normalizeTypedFiles(req: Request) {
	const bag = req.files as
		| Record<string, Express.Multer.File[]>
		| Express.Multer.File[]
		| undefined;

	if (!bag || Array.isArray(bag)) {
		return {
			declaracao: null,
			recibo: null,
			anexos: [] as Express.Multer.File[],
		};
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
