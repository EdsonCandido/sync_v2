import {
	createFinancialEntrySchema,
	listFinancialEntriesQuerySchema,
	renegotiateFinancialEntrySchema,
	settleFinancialEntrySchema,
	updateFinancialEntrySchema,
} from "@sync_v2/contracts";
import type { Request, Response } from "express";
import { CancelFinancialEntryService } from "../services/CancelFinancialEntryService";
import { CreateFinancialEntryService } from "../services/CreateFinancialEntryService";
import {
	DownloadFinancialEntryAttachmentService,
	SoftDeleteFinancialEntryAttachmentService,
	UploadFinancialEntryAttachmentService,
} from "../services/FinancialEntryAttachmentServices";
import { FindFinancialEntryService } from "../services/FindFinancialEntryService";
import { ListFinancialEntriesService } from "../services/ListFinancialEntriesService";
import { ListFinancialEntryGroupService } from "../services/ListFinancialEntryGroupService";
import { RenegotiateFinancialEntryService } from "../services/RenegotiateFinancialEntryService";
import { ReverseFinancialEntryPaymentService } from "../services/ReverseFinancialEntryPaymentService";
import { SettleFinancialEntryService } from "../services/SettleFinancialEntryService";
import { SoftDeleteFinancialEntryService } from "../services/SoftDeleteFinancialEntryService";
import { UpdateFinancialEntryService } from "../services/UpdateFinancialEntryService";
import { AppError } from "../utils/AppError";
import {
	clientIp,
	handleFinanceiroError,
	requireCompanyId,
} from "./financeiroHttp";

export class FinancialEntryController {
	constructor(
		private readonly listService = new ListFinancialEntriesService(),
		private readonly listGroupService = new ListFinancialEntryGroupService(),
		private readonly findService = new FindFinancialEntryService(),
		private readonly createService = new CreateFinancialEntryService(),
		private readonly updateService = new UpdateFinancialEntryService(),
		private readonly cancelService = new CancelFinancialEntryService(),
		private readonly softDeleteService = new SoftDeleteFinancialEntryService(),
		private readonly settleService = new SettleFinancialEntryService(),
		private readonly reversePaymentService = new ReverseFinancialEntryPaymentService(),
		private readonly renegotiateService = new RenegotiateFinancialEntryService(),
		private readonly uploadAttachmentService = new UploadFinancialEntryAttachmentService(),
		private readonly downloadAttachmentService = new DownloadFinancialEntryAttachmentService(),
		private readonly softDeleteAttachmentService = new SoftDeleteFinancialEntryAttachmentService(),
	) {}

	list = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const query = listFinancialEntriesQuerySchema.parse(req.query);
			res.json(await this.listService.execute(query, companyId));
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	listGroup = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.listGroupService.execute(
					String(req.params.groupId),
					companyId,
				),
			);
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
			const body = createFinancialEntrySchema.parse(req.body);
			res.status(201).json(
				await this.createService.execute(body, {
					companyId,
					userId: req.authSession!.user.id,
					ip: clientIp(req),
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	update = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = updateFinancialEntrySchema.parse(req.body);
			res.json(
				await this.updateService.execute(String(req.params.id), body, {
					companyId,
					userId: req.authSession!.user.id,
					ip: clientIp(req),
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	cancel = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.cancelService.execute(String(req.params.id), {
					companyId,
					userId: req.authSession!.user.id,
					ip: clientIp(req),
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

	settle = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = settleFinancialEntrySchema.parse(req.body);
			res.json(
				await this.settleService.execute(String(req.params.id), body, {
					companyId,
					userId: req.authSession!.user.id,
					ip: clientIp(req),
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	reversePayment = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.reversePaymentService.execute(
					String(req.params.id),
					String(req.params.paymentId),
					{
						companyId,
						userId: req.authSession!.user.id,
						ip: clientIp(req),
					},
				),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	renegotiate = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const body = renegotiateFinancialEntrySchema.parse(req.body);
			res.json(
				await this.renegotiateService.execute(String(req.params.id), body, {
					companyId,
					userId: req.authSession!.user.id,
					ip: clientIp(req),
				}),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	uploadAttachment = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const file = req.file;
			if (!file) {
				throw new AppError(400, "Arquivo obrigatório.");
			}
			res.status(201).json(
				await this.uploadAttachmentService.execute(
					String(req.params.id),
					file,
					{
						companyId,
						userId: req.authSession!.user.id,
						ip: clientIp(req),
					},
				),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	downloadAttachment = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			const file = await this.downloadAttachmentService.execute(
				String(req.params.id),
				String(req.params.attachmentId),
				companyId,
			);
			res.setHeader("Content-Type", file.mimeType);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${encodeURIComponent(file.originalName)}"`,
			);
			res.send(file.content);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};

	softDeleteAttachment = async (req: Request, res: Response) => {
		try {
			const companyId = requireCompanyId(req);
			res.json(
				await this.softDeleteAttachmentService.execute(
					String(req.params.id),
					String(req.params.attachmentId),
					{
						companyId,
						userId: req.authSession!.user.id,
						ip: clientIp(req),
					},
				),
			);
		} catch (error) {
			handleFinanceiroError(res, error);
		}
	};
}
