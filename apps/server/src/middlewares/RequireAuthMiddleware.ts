import type { NextFunction, Request, Response } from "express";
import { auth } from "../auth";
import type { AuthSession } from "../types/express";

export class RequireAuthMiddleware {
	async handle(req: Request, res: Response, next: NextFunction) {
		try {
			const session = await auth.api.getSession({
				headers: fromNodeHeaders(req.headers),
			});

			if (!session) {
				res.status(401).json({ message: "Não autenticado." });
				return;
			}

			req.authSession = session as AuthSession;
			next();
		} catch {
			res.status(401).json({ message: "Não autenticado." });
		}
	}
}

function fromNodeHeaders(
	headers: Request["headers"],
): Headers {
	const result = new Headers();
	for (const [key, value] of Object.entries(headers)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			for (const v of value) result.append(key, v);
		} else {
			result.set(key, value);
		}
	}
	return result;
}

export const requireAuth = new RequireAuthMiddleware();
