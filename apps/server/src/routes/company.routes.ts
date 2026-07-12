import { Router } from "express";
import { CompanyController } from "../controllers/CompanyController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireSuper } from "../middlewares/RequireSuperMiddleware";

const controller = new CompanyController();

export const companyRoutes = Router();

companyRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireSuper.handle(req, res, next),
);

companyRoutes.get("/", controller.list);
companyRoutes.get("/:id", controller.find);
companyRoutes.post("/", controller.create);
companyRoutes.put("/:id", controller.update);
companyRoutes.patch("/:id", controller.update);
companyRoutes.delete("/:id", controller.softDelete);
