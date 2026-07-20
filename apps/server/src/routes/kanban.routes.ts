import { Router } from "express";
import { KanbanController } from "../controllers/KanbanController";
import { kanbanAttachmentUpload } from "../middlewares/KanbanAttachmentUploadMiddleware";
import { requireAuth } from "../middlewares/RequireAuthMiddleware";
import { requireModuleAccess } from "../middlewares/RequireModuleAccessMiddleware";

const controller = new KanbanController();
const readAccess = requireModuleAccess("kanban", "read");
const editAccess = requireModuleAccess("kanban", "edit");

export const kanbanRoutes = Router();

kanbanRoutes.use((req, res, next) => requireAuth.handle(req, res, next));

kanbanRoutes.get("/boards", readAccess.handle, controller.listBoards);
kanbanRoutes.post("/boards", editAccess.handle, controller.createBoard);
kanbanRoutes.put("/boards/:boardId", editAccess.handle, controller.updateBoard);
kanbanRoutes.delete(
	"/boards/:boardId",
	editAccess.handle,
	controller.softDeleteBoard,
);

kanbanRoutes.get("/board", readAccess.handle, controller.getBoard);
kanbanRoutes.get(
	"/filter-options",
	readAccess.handle,
	controller.listFilterOptions,
);
kanbanRoutes.post("/columns", editAccess.handle, controller.createColumn);
kanbanRoutes.delete(
	"/columns/:columnId",
	editAccess.handle,
	controller.softDeleteColumn,
);

kanbanRoutes.post("/cards", editAccess.handle, controller.createCard);
kanbanRoutes.get("/cards/:cardId", readAccess.handle, controller.findCard);
kanbanRoutes.put("/cards/:cardId", editAccess.handle, controller.updateCard);
kanbanRoutes.patch(
	"/cards/:cardId/move",
	editAccess.handle,
	controller.moveCard,
);
kanbanRoutes.post(
	"/cards/:cardId/recreate",
	editAccess.handle,
	controller.recreateCard,
);
kanbanRoutes.delete(
	"/cards/:cardId",
	editAccess.handle,
	controller.softDeleteCard,
);

kanbanRoutes.post(
	"/cards/:cardId/checklist",
	editAccess.handle,
	controller.createChecklistItem,
);
kanbanRoutes.patch(
	"/cards/:cardId/checklist/:itemId",
	editAccess.handle,
	controller.updateChecklistItem,
);
kanbanRoutes.delete(
	"/cards/:cardId/checklist/:itemId",
	editAccess.handle,
	controller.softDeleteChecklistItem,
);

kanbanRoutes.post(
	"/cards/:cardId/observations",
	editAccess.handle,
	controller.addObservation,
);

kanbanRoutes.post(
	"/cards/:cardId/attachments",
	editAccess.handle,
	kanbanAttachmentUpload.single("file"),
	controller.uploadAttachment,
);
kanbanRoutes.get(
	"/cards/:cardId/attachments/:attachmentId/download",
	readAccess.handle,
	controller.downloadAttachment,
);
kanbanRoutes.delete(
	"/cards/:cardId/attachments/:attachmentId",
	editAccess.handle,
	controller.softDeleteAttachment,
);
