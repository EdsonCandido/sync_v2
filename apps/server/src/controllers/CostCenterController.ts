import {
	createCostCenterSchema,
	listCostCentersQuerySchema,
	updateCostCenterSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateCostCenterService } from "../services/CreateCostCenterService";
import { FindCostCenterService } from "../services/FindCostCenterService";
import { ListCostCentersService } from "../services/ListCostCentersService";
import { SoftDeleteCostCenterService } from "../services/SoftDeleteCostCenterService";
import { UpdateCostCenterService } from "../services/UpdateCostCenterService";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

export class CostCenterController {
	constructor(
		private readonly listService = new ListCostCentersService(),
		private readonly findService = new FindCostCenterService(),
		private readonly createService = new CreateCostCenterService(),
		private readonly updateService = new UpdateCostCenterService(),
		private readonly softDeleteService = new SoftDeleteCostCenterService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listCostCentersQuerySchema.parse(req.query);
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
			const body = createCostCenterSchema.parse(req.body);
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
			const body = updateCostCenterSchema.parse(req.body);
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
