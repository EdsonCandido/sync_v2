import { Router } from "express";
import { GeocodeController } from "../controllers/GeocodeController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireCepGeocodeAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new GeocodeController();

export const geocodeRoutes = Router();

geocodeRoutes.use(
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCepGeocodeAccess.handle(req, res, next),
);

geocodeRoutes.post("/", controller.geocode);
