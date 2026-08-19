import { Router } from "express";
import { AccessMonitorController } from "../controllers/AccessMonitorController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireSuper } from "../middlewares/RequireSuperMiddleware";

const controller = new AccessMonitorController();

export const accessMonitorRoutes = Router();

accessMonitorRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireSuper.handle(req, res, next),
);

accessMonitorRoutes.get("/sessions", controller.listSessions);
accessMonitorRoutes.get("/history", controller.listHistory);
