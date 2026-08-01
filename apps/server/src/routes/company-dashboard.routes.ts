import { Router } from "express";
import { CompanyDashboardController } from "../controllers/CompanyDashboardController";
import { DashboardWidgetsController } from "../controllers/DashboardWidgetsController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireCompanyAdmin } from "../middlewares/RequireCompanyAdminMiddleware";

const controller = new CompanyDashboardController();
const widgetsController = new DashboardWidgetsController();

export const companyDashboardRoutes = Router();

companyDashboardRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCompanyAdmin.handle(req, res, next),
);

companyDashboardRoutes.get("/", controller.get);

companyDashboardRoutes.get("/widgets", widgetsController.get);
companyDashboardRoutes.put("/widgets/layout", widgetsController.updateLayout);

companyDashboardRoutes.post(
	"/widgets/favorites",
	widgetsController.createFavorite,
);
companyDashboardRoutes.put(
	"/widgets/favorites/:id",
	widgetsController.updateFavorite,
);
companyDashboardRoutes.delete(
	"/widgets/favorites/:id",
	widgetsController.softDeleteFavorite,
);

companyDashboardRoutes.post("/widgets/goals", widgetsController.createGoal);
companyDashboardRoutes.put(
	"/widgets/goals/:id",
	widgetsController.updateGoal,
);
companyDashboardRoutes.delete(
	"/widgets/goals/:id",
	widgetsController.softDeleteGoal,
);
