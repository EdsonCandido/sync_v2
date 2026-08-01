import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireModuleAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new AppointmentController();
const readAccess = requireModuleAccess("agendamentos", "read");
const editAccess = requireModuleAccess("agendamentos", "edit");

export const agendamentosRoutes = Router();

agendamentosRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

agendamentosRoutes.get("/", readAccess.handle, controller.list);
agendamentosRoutes.get("/:id", readAccess.handle, controller.find);
agendamentosRoutes.post("/", editAccess.handle, controller.create);
agendamentosRoutes.put("/:id", editAccess.handle, controller.update);
agendamentosRoutes.delete("/:id", editAccess.handle, controller.softDelete);
