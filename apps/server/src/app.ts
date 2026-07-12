import { env } from "@sync_v2/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth";
import { registerRoutes } from "./routes";

export function createApp() {
	const app = express();

	app.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);

	app.all("/api/auth{/*path}", toNodeHandler(auth));

	app.use(express.json());

	registerRoutes(app);

	return app;
}
