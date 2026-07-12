import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireUsuariosAccess } from "../middlewares/RequireUsuariosAccessMiddleware";

const controller = new UserController();
const readAccess = requireUsuariosAccess("read");
const editAccess = requireUsuariosAccess("edit");

export const userRoutes = Router();

userRoutes.post(
	"/me/password",
	requireAuth.handle,
	controller.changeOwnPassword,
);

userRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

userRoutes.get("/", readAccess.handle, controller.list);
userRoutes.get("/:id", readAccess.handle, controller.find);
userRoutes.post("/", editAccess.handle, controller.create);
userRoutes.put("/:id", editAccess.handle, controller.update);
userRoutes.delete("/:id", editAccess.handle, controller.softDelete);
userRoutes.patch(
	"/:id/password",
	editAccess.handle,
	controller.adminSetPassword,
);
