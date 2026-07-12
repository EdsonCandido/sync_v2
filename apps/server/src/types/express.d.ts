import type { Request } from "express";

export type AuthSessionUser = {
	id: string;
	name: string;
	email: string;
	perfil?: string | null;
	companyId?: string | null;
	ativo?: boolean | null;
};

export type AuthSession = {
	session: { id: string; userId: string; token: string };
	user: AuthSessionUser;
};

declare global {
	namespace Express {
		interface Request {
			authSession?: AuthSession;
		}
	}
}

export type AuthenticatedRequest = Request & {
	authSession: AuthSession;
};
