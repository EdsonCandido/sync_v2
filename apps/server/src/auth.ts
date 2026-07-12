import { createAuth } from "@sync_v2/auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { RecordUserAccessService } from "./services/RecordUserAccessService";
import { ValidateLoginAccessService } from "./services/ValidateLoginAccessService";

const validateLoginAccess = new ValidateLoginAccessService();
const recordUserAccess = new RecordUserAccessService();

export const auth = createAuth({
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-in/email") {
				return;
			}

			const returned = ctx.context.returned as
				| {
						user?: {
							id: string;
							perfil?: string;
							companyId?: string | null;
						};
						session?: { token?: string };
				  }
				| undefined;

			const user = returned?.user;
			if (!user) {
				return;
			}

			const result = await validateLoginAccess.execute({
				userId: user.id,
				perfil: user.perfil ?? "cliente",
				companyId: user.companyId,
				ativo: (user as { ativo?: boolean | null }).ativo,
				blocked: (user as { blocked?: boolean | null }).blocked,
			});

			if (!result.ok) {
				const token = returned?.session?.token;
				if (token) {
					try {
						await ctx.context.internalAdapter.deleteSession(token);
					} catch {
						// ignore cleanup failure
					}
				}
				throw new APIError("FORBIDDEN", {
					message: result.message,
				});
			}

			try {
				await recordUserAccess.execute({
					userId: user.id,
					companyId: user.companyId,
				});
			} catch {
				// access tracking must not block login
			}
		}),
	},
});
