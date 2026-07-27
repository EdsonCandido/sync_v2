import { Router } from "express";
import { PublicItrController } from "../controllers/PublicItrController";

const controller = new PublicItrController();

export const publicItrRoutes = Router();

publicItrRoutes.get("/consultar", controller.consult);
publicItrRoutes.get("/files/:fileId", controller.downloadFile);
