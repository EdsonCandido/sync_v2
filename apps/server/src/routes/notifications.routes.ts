import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";

const controller = new NotificationController();

export const notificationsRoutes = Router();

notificationsRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

notificationsRoutes.get("/", controller.list);
notificationsRoutes.patch("/:id/read", controller.markRead);
notificationsRoutes.post("/read-all", controller.markAllRead);
