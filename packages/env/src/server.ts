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
		/** Bootstrap Helios — obrigatórios ao rodar `db:seed` / SEED_ON_START. */
		SEED_SUPER_NAME: z.string().min(1).optional(),
		SEED_SUPER_EMAIL: z.email().optional(),
		SEED_SUPER_PASSWORD: z.string().min(8).optional(),
		SEED_ADMIN_NAME: z.string().min(1).optional(),
		SEED_ADMIN_EMAIL: z.email().optional(),
		SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
		SEED_CLIENTE_NAME: z.string().min(1).optional(),
		SEED_CLIENTE_EMAIL: z.email().optional(),
		SEED_CLIENTE_PASSWORD: z.string().min(8).optional(),
		SEED_COMPANY_NAME: z.string().min(1).optional(),
		SEED_COMPANY_DOCUMENT: z.string().min(1).optional(),
		SEED_COMPANY_EMAIL: z.email().optional(),
		SEED_CLIENT_NAME: z.string().min(1).optional(),
		SEED_CLIENT_DOCUMENT: z.string().min(1).optional(),
		SEED_BANK_NAME: z.string().min(1).optional(),
		SEED_BANK_AGENCIA: z.string().min(1).optional(),
		SEED_BANK_CONTA: z.string().min(1).optional(),
		SEED_SUPPLIER_NAME: z.string().min(1).optional(),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
