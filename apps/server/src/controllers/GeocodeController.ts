import { geocodeRequestSchema } from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { GeocodeAddressService } from "../services/GeocodeAddressService";
import { AppError } from "../utils/AppError";

export class GeocodeController {
	constructor(
		private readonly geocodeAddressService = new GeocodeAddressService(),
	) {}

	geocode = async (req: Request, res: Response) => {
		try {
			const body = geocodeRequestSchema.parse(req.body);
			const result = await this.geocodeAddressService.execute(body);
			res.json(result);
		} catch (error) {
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
	};
}
