import { Router } from "express";
import { CepController } from "../controllers/CepController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireCepGeocodeAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new CepController();

export const cepRoutes = Router();

cepRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCepGeocodeAccess.handle(req, res, next),
);

cepRoutes.get("/:cep", controller.lookup);
