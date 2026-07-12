import {
	createSupplierSchema,
	listSuppliersQuerySchema,
	updateSupplierSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateSupplierService } from "../services/CreateSupplierService";
import { FindSupplierService } from "../services/FindSupplierService";
import { ListSuppliersService } from "../services/ListSuppliersService";
import { SoftDeleteSupplierService } from "../services/SoftDeleteSupplierService";
import { UpdateSupplierService } from "../services/UpdateSupplierService";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

export class SupplierController {
	constructor(
		private readonly listService = new ListSuppliersService(),
		private readonly findService = new FindSupplierService(),
		private readonly createService = new CreateSupplierService(),
		private readonly updateService = new UpdateSupplierService(),
		private readonly softDeleteService = new SoftDeleteSupplierService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listSuppliersQuerySchema.parse(req.query);
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
			const body = createSupplierSchema.parse(req.body);
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
			const body = updateSupplierSchema.parse(req.body);
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
