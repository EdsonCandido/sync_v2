import { Router } from "express";
import { PlanController } from "../controllers/PlanController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireSuper } from "../middlewares/RequireSuperMiddleware";

const controller = new PlanController();

export const planRoutes = Router();

planRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireSuper.handle(req, res, next),
);

planRoutes.get("/", controller.list);
planRoutes.get("/options", controller.options);
planRoutes.get("/:id", controller.find);
planRoutes.post("/", controller.create);
planRoutes.put("/:id", controller.update);
planRoutes.patch("/:id", controller.update);
planRoutes.delete("/:id", controller.softDelete);
