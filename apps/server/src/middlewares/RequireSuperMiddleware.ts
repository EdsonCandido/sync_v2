import type { NextFunction, Request, Response } from "express";

export class RequireSuperMiddleware {
	handle(req: Request, res: Response, next: NextFunction) {
		const perfil = req.authSession?.user?.perfil;
		if (perfil !== "super") {
			res.status(403).json({ message: "Acesso restrito a super usuários." });
			return;
		}
		next();
	}
}

export const requireSuper = new RequireSuperMiddleware();
