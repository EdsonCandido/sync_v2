import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireModuleAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new ClientController();
const readAccess = requireModuleAccess("clientes", "read");
const editAccess = requireModuleAccess("clientes", "edit");

export const clientRoutes = Router();

clientRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

clientRoutes.get("/", readAccess.handle, controller.list);
clientRoutes.get("/:id", readAccess.handle, controller.find);
clientRoutes.post("/", editAccess.handle, controller.create);
clientRoutes.put("/:id", editAccess.handle, controller.update);
clientRoutes.patch("/:id", editAccess.handle, controller.update);
clientRoutes.delete("/:id", editAccess.handle, controller.softDelete);
