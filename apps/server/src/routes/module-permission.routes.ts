import { Router } from "express";
import { ModulePermissionController } from "../controllers/ModulePermissionController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireCompanyAdmin } from "../middlewares/RequireCompanyAdminMiddleware";

const controller = new ModulePermissionController();

export const modulePermissionRoutes = Router();

modulePermissionRoutes.get(
	"/me",
	(req, res, next) => requireAuth.handle(req, res, next),
	controller.me,
);

modulePermissionRoutes.get(
	"/users",
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCompanyAdmin.handle(req, res, next),
	controller.listUsers,
);

modulePermissionRoutes.put(
	"/users/:userId",
	(req, res, next) => requireAuth.handle(req, res, next),
	(req, res, next) => requireCompanyAdmin.handle(req, res, next),
	controller.upsertUser,
);
