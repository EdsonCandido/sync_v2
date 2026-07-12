import {
	createBankAccountSchema,
	listBankAccountsQuerySchema,
	updateBankAccountSchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CreateBankAccountService } from "../services/CreateBankAccountService";
import { FindBankAccountService } from "../services/FindBankAccountService";
import { ListBankAccountsService } from "../services/ListBankAccountsService";
import { SoftDeleteBankAccountService } from "../services/SoftDeleteBankAccountService";
import { UpdateBankAccountService } from "../services/UpdateBankAccountService";
import { handleFinanceiroError, requireCompanyId } from "./financeiroHttp";

export class BankAccountController {
	constructor(
		private readonly listService = new ListBankAccountsService(),
		private readonly findService = new FindBankAccountService(),
		private readonly createService = new CreateBankAccountService(),
		private readonly updateService = new UpdateBankAccountService(),
		private readonly softDeleteService = new SoftDeleteBankAccountService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listBankAccountsQuerySchema.parse(req.query);
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
			const body = createBankAccountSchema.parse(req.body);
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
			const body = updateBankAccountSchema.parse(req.body);
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
