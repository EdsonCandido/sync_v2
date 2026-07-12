import type { Request, Response } from "express";
import { LookupCepService } from "../services/LookupCepService";
import { AppError } from "../utils/AppError";

export class CepController {
	constructor(private readonly lookupCepService = new LookupCepService()) {}

	lookup = async (req: Request, res: Response) => {
		try {
			const cep = String(req.params.cep ?? "");
			const result = await this.lookupCepService.execute(cep);
			res.json(result);
		} catch (error) {
			if (error instanceof AppError) {
				res.status(error.status).json({ message: error.message });
				return;
			}
			console.error(error);
			res.status(500).json({ message: "Erro interno." });
		}
	};
}
