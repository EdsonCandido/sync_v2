import {
	createFinancialCategorySchema,
	listFinancialCategoriesQuerySchema,
	updateFinancialCategorySchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateFinancialCategoryService } from "../services/CreateFinancialCategoryService";
import { FindFinancialCategoryService } from "../services/FindFinancialCategoryService";
import { ListFinancialCategoriesService } from "../services/ListFinancialCategoriesService";
import { SoftDeleteFinancialCategoryService } from "../services/SoftDeleteFinancialCategoryService";
import { UpdateFinancialCategoryService } from "../services/UpdateFinancialCategoryService";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

export class FinancialCategoryController {
	constructor(
		private readonly listService = new ListFinancialCategoriesService(),
		private readonly findService = new FindFinancialCategoryService(),
		private readonly createService = new CreateFinancialCategoryService(),
		private readonly updateService = new UpdateFinancialCategoryService(),
		private readonly softDeleteService = new SoftDeleteFinancialCategoryService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listFinancialCategoriesQuerySchema.parse(req.query);
			res.json(await this.listService.execute(query, companyId));
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	find = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.findService.execute(String(req.params.id), companyId),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	create = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = createFinancialCategorySchema.parse(req.body);
			res.status(201).json(
				await this.createService.execute(body, {
					companyId,
					userId: req.authSession!.user.id,
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = updateFinancialCategorySchema.parse(req.body);
			res.json(
				await this.updateService.execute(String(req.params.id), body, {
					companyId,
					userId: req.authSession!.user.id,
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	softDelete = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.softDeleteService.execute(
					String(req.params.id),
					companyId,
					req.authSession!.user.id,
				),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};
}
