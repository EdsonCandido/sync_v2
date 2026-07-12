import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

const envDir = path.dirname(fileURLToPath(import.meta.url));

for (const candidate of [
	path.resolve(process.cwd(), ".env"),
	path.resolve(process.cwd(), "apps/server/.env"),
	path.resolve(envDir, "../../../apps/server/.env"),
]) {
	dotenv.config({ path: candidate });
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		/** Credenciais do seed inicial — obrigatórias só ao rodar `db:seed`. */
		SEED_SUPER_NAME: z.string().min(1).optional(),
		SEED_SUPER_EMAIL: z.email().optional(),
		SEED_SUPER_PASSWORD: z.string().min(8).optional(),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
