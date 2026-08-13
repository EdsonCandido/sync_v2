import { Router } from "express";
import { PublicItrController } from "../controllers/PublicItrController";
import { publicItrRateLimit } from "../middlewares/PublicItrRateLimitMiddleware";

const controller = new PublicItrController();

export const publicItrRoutes = Router();

publicItrRoutes.use((req, res, next) =>
	publicItrRateLimit.handle(req, res, next),
);

publicItrRoutes.get("/consultar", controller.consult);
publicItrRoutes.get("/files/:fileId", controller.downloadFile);
