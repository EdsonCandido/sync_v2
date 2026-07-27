import {
	publicItrConsultQuerySchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import {
	PublicConsultItrService,
	PublicDownloadItrFileService,
} from "../services/PublicConsultItrService";
import { AppError } from "../utils/AppError";

export class PublicItrController {
	constructor(
		private readonly consultService = new PublicConsultItrService(),
		private readonly downloadService = new PublicDownloadItrFileService(),
	) {}

	consult = async (req: Request, res: Response) => {
		try {
			const query = publicItrConsultQuerySchema.parse(req.query);
			const result = await this.consultService.execute(query.cpf);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	downloadFile = async (req: Request, res: Response) => {
		try {
			const fileId = String(req.params.fileId);
			const query = publicItrConsultQuerySchema.parse(req.query);
			const file = await this.downloadService.execute(fileId, query.cpf);
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
