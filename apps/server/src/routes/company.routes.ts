import { Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { CompanyModulePermissionController } from "../controllers/CompanyModulePermissionController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireSuper } from "../middlewares/RequireSuperMiddleware";

const controller = new CompanyController();
const moduleController = new CompanyModulePermissionController();

export const companyRoutes = Router();

companyRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireSuper.handle(req, res, next),
);

companyRoutes.get("/", controller.list);
companyRoutes.get("/:companyId/modules", moduleController.list);
companyRoutes.put("/:companyId/modules", moduleController.upsert);
companyRoutes.get("/:id", controller.find);
companyRoutes.post("/", controller.create);
companyRoutes.put("/:id", controller.update);
companyRoutes.patch("/:id", controller.update);
companyRoutes.delete("/:id", controller.softDelete);
