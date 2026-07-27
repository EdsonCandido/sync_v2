import { Router } from "express";
import { ItrController } from "../controllers/ItrController";
import {
	itrFileUpload,
	itrFilesUpload,
} from "../middlewares/ItrFileUploadMiddleware";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireModuleAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new ItrController();
const readAccess = requireModuleAccess("itr", "read");
const editAccess = requireModuleAccess("itr", "edit");

export const itrRoutes = Router();

itrRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

itrRoutes.get("/", readAccess.handle, controller.list);
itrRoutes.get("/:id", readAccess.handle, controller.find);
itrRoutes.post(
	"/",
	editAccess.handle,
	itrFilesUpload.fields([
		{ name: "declaracao", maxCount: 1 },
		{ name: "recibo", maxCount: 1 },
		{ name: "anexos", maxCount: 18 },
	]),
	controller.create,
);
itrRoutes.delete("/:id", editAccess.handle, controller.softDelete);

itrRoutes.post(
	"/:id/files",
	editAccess.handle,
	itrFileUpload.single("file"),
	controller.uploadFile,
);
itrRoutes.get(
	"/:id/files/:fileId",
	readAccess.handle,
	controller.downloadFile,
);
itrRoutes.delete(
	"/:id/files/:fileId",
	editAccess.handle,
	controller.softDeleteFile,
);
