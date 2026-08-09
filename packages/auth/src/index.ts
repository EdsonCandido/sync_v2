import { createDb } from "@sync_v2/db";
import * as schema from "@sync_v2/db/schema/auth";
import { env } from "@sync_v2/env/server";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export type AuthHooks = {
	before?: ReturnType<typeof import("better-auth/api").createAuthMiddleware>;
	after?: ReturnType<typeof import("better-auth/api").createAuthMiddleware>;
};

export type CreateAuthOptions = {
	hooks?: AuthHooks;
	plugins?: BetterAuthPlugin[];
};

export function createAuth(options: CreateAuthOptions = {}) {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: schema,
		}),
		trustedOrigins: env.CORS_ORIGIN,
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 6,
		},
		user: {
			additionalFields: {
				ativo: {
					type: "boolean",
					required: false,
					defaultValue: true,
					input: false,
				},
				perfil: {
					type: "string",
					required: false,
					defaultValue: "cliente",
					input: false,
				},
				companyId: {
					type: "string",
					required: false,
					input: false,
				},
				department: {
					type: "string",
					required: false,
					input: false,
				},
				blocked: {
					type: "boolean",
					required: false,
					defaultValue: false,
					input: false,
				},
				lastAccessAt: {
					type: "date",
					required: false,
					input: false,
				},
				createdBy: {
					type: "string",
					required: false,
					input: false,
				},
				updatedBy: {
					type: "string",
					required: false,
					input: false,
				},
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			database: {
				generateId: "uuid",
			},
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
		},
		hooks: options.hooks,
		plugins: options.plugins ?? [],
	});
}

/** Instância padrão sem hooks de domínio (seed / package). Preferir `apps/server/src/auth.ts` na API. */
export const auth = createAuth();
