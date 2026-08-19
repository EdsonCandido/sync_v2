import { Router } from "express";
import { BankAccountController } from "../controllers/BankAccountController";
import { CostCenterController } from "../controllers/CostCenterController";
import { FinanceiroDashboardController } from "../controllers/FinanceiroDashboardController";
import { FinanceiroReportController } from "../controllers/FinanceiroReportController";
import { FinancialCategoryController } from "../controllers/FinancialCategoryController";
import { FinancialEntryController } from "../controllers/FinancialEntryController";
import { SupplierController } from "../controllers/SupplierController";
import { financialEntryAttachmentUpload } from "../middlewares/FinancialEntryAttachmentUploadMiddleware";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireModuleAccess } from "../middlewares/RequireModuleAccessMiddleware";

const dashboardController = new FinanceiroDashboardController();
const reportController = new FinanceiroReportController();
const categoryController = new FinancialCategoryController();
const costCenterController = new CostCenterController();
const bankAccountController = new BankAccountController();
const supplierController = new SupplierController();
const entryController = new FinancialEntryController();

const readAccess = requireModuleAccess("financeiro", "read");
const editAccess = requireModuleAccess("financeiro", "edit");

export const financeiroRoutes = Router();

financeiroRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

financeiroRoutes.get("/dashboard", readAccess.handle, dashboardController.get);
financeiroRoutes.get(
	"/relatorios/saude-financeira.pdf",
	readAccess.handle,
	reportController.saudeFinanceiraPdf,
);
financeiroRoutes.get("/relatorios", readAccess.handle, reportController.list);
financeiroRoutes.get(
	"/relatorios/:slug/pdf",
	readAccess.handle,
	reportController.pdf,
);
financeiroRoutes.get(
	"/relatorios/:slug",
	readAccess.handle,
	reportController.get,
);

financeiroRoutes.get("/categorias", readAccess.handle, categoryController.list);
financeiroRoutes.get(
	"/categorias/:id",
	readAccess.handle,
	categoryController.find,
);
financeiroRoutes.post(
	"/categorias",
	editAccess.handle,
	categoryController.create,
);
financeiroRoutes.put(
	"/categorias/:id",
	editAccess.handle,
	categoryController.update,
);
financeiroRoutes.patch(
	"/categorias/:id",
	editAccess.handle,
	categoryController.update,
);
financeiroRoutes.delete(
	"/categorias/:id",
	editAccess.handle,
	categoryController.softDelete,
);

financeiroRoutes.get(
	"/centros-de-custo",
	readAccess.handle,
	costCenterController.list,
);
financeiroRoutes.get(
	"/centros-de-custo/:id",
	readAccess.handle,
	costCenterController.find,
);
financeiroRoutes.post(
	"/centros-de-custo",
	editAccess.handle,
	costCenterController.create,
);
financeiroRoutes.put(
	"/centros-de-custo/:id",
	editAccess.handle,
	costCenterController.update,
);
financeiroRoutes.patch(
	"/centros-de-custo/:id",
	editAccess.handle,
	costCenterController.update,
);
financeiroRoutes.delete(
	"/centros-de-custo/:id",
	editAccess.handle,
	costCenterController.softDelete,
);

financeiroRoutes.get("/bancos", readAccess.handle, bankAccountController.list);
financeiroRoutes.get(
	"/bancos/:id",
	readAccess.handle,
	bankAccountController.find,
);
financeiroRoutes.post(
	"/bancos",
	editAccess.handle,
	bankAccountController.create,
);
financeiroRoutes.put(
	"/bancos/:id",
	editAccess.handle,
	bankAccountController.update,
);
financeiroRoutes.patch(
	"/bancos/:id",
	editAccess.handle,
	bankAccountController.update,
);
financeiroRoutes.delete(
	"/bancos/:id",
	editAccess.handle,
	bankAccountController.softDelete,
);

financeiroRoutes.get(
	"/fornecedores",
	readAccess.handle,
	supplierController.list,
);
financeiroRoutes.get(
	"/fornecedores/:id",
	readAccess.handle,
	supplierController.find,
);
financeiroRoutes.post(
	"/fornecedores",
	editAccess.handle,
	supplierController.create,
);
financeiroRoutes.put(
	"/fornecedores/:id",
	editAccess.handle,
	supplierController.update,
);
financeiroRoutes.patch(
	"/fornecedores/:id",
	editAccess.handle,
	supplierController.update,
);
financeiroRoutes.delete(
	"/fornecedores/:id",
	editAccess.handle,
	supplierController.softDelete,
);

financeiroRoutes.get("/lancamentos", readAccess.handle, entryController.list);
financeiroRoutes.get(
	"/lancamentos/grupo/:groupId",
	readAccess.handle,
	entryController.listGroup,
);
financeiroRoutes.get(
	"/lancamentos/:id",
	readAccess.handle,
	entryController.find,
);
financeiroRoutes.post(
	"/lancamentos",
	editAccess.handle,
	entryController.create,
);
financeiroRoutes.put(
	"/lancamentos/:id",
	editAccess.handle,
	entryController.update,
);
financeiroRoutes.patch(
	"/lancamentos/:id",
	editAccess.handle,
	entryController.update,
);
financeiroRoutes.delete(
	"/lancamentos/:id",
	editAccess.handle,
	entryController.softDelete,
);

financeiroRoutes.post(
	"/lancamentos/:id/baixar",
	editAccess.handle,
	entryController.settle,
);
financeiroRoutes.post(
	"/lancamentos/:id/pagamentos/:paymentId/estornar",
	editAccess.handle,
	entryController.reversePayment,
);
financeiroRoutes.post(
	"/lancamentos/:id/renegociar",
	editAccess.handle,
	entryController.renegotiate,
);
financeiroRoutes.post(
	"/lancamentos/:id/cancelar",
	editAccess.handle,
	entryController.cancel,
);

financeiroRoutes.post(
	"/lancamentos/:id/anexos",
	editAccess.handle,
	financialEntryAttachmentUpload.single("file"),
	entryController.uploadAttachment,
);
financeiroRoutes.get(
	"/lancamentos/:id/anexos/:attachmentId/download",
	readAccess.handle,
	entryController.downloadAttachment,
);
financeiroRoutes.delete(
	"/lancamentos/:id/anexos/:attachmentId",
	editAccess.handle,
	entryController.softDeleteAttachment,
);
