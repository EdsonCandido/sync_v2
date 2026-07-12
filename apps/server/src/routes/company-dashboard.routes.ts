import { Router } from "express";
import { CompanyDashboardController } from "../controllers/CompanyDashboardController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireCompanyAdmin } from "../middlewares/RequireCompanyAdminMiddleware";

const controller = new CompanyDashboardController();

export const companyDashboardRoutes = Router();

companyDashboardRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCompanyAdmin.handle(req, res, next),
);

companyDashboardRoutes.get("/", controller.get);
