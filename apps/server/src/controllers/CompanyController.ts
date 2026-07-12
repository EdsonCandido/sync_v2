import {
	createCompanySchema,
	listCompaniesQuerySchema,
	updateCompanySchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateCompanyService } from "../services/CreateCompanyService";
import { FindCompanyService } from "../services/FindCompanyService";
import { ListCompaniesService } from "../services/ListCompaniesService";
import { SoftDeleteCompanyService } from "../services/SoftDeleteCompanyService";
import { UpdateCompanyService } from "../services/UpdateCompanyService";
import { AppError } from "../utils/AppError";

export class CompanyController {
	constructor(
		private readonly listCompaniesService = new ListCompaniesService(),
		private readonly findCompanyService = new FindCompanyService(),
		private readonly createCompanyService = new CreateCompanyService(),
		private readonly updateCompanyService = new UpdateCompanyService(),
		private readonly softDeleteCompanyService = new SoftDeleteCompanyService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const query = listCompaniesQuerySchema.parse(req.query);
			const result = await this.listCompaniesService.execute(query);
			res.json(result);
		} catch (error) {
			handleError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const company = await this.findCompanyService.execute(id);
			res.json(company);
		} catch (error) {
			handleError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const body = createCompanySchema.parse(req.body);
			const userId = req.authSession!.user.id;
			const company = await this.createCompanyService.execute(body, userId);
			res.status(201).json(company);
		} catch (error) {
			handleError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const body = updateCompanySchema.parse(req.body);
			const userId = req.authSession!.user.id;
			const company = await this.updateCompanyService.execute(id, body, userId);
			res.json(company);
		} catch (error) {
			handleError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const id = String(req.params.id);
			const userId = req.authSession!.user.id;
			const company = await this.softDeleteCompanyService.execute(id, userId);
			res.json(company);
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
