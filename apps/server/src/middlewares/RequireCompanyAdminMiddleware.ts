import type { NextFunction, Request, Response } from "express";

export class RequireCompanyAdminMiddleware {
	handle(req: Request, res: Response, next: NextFunction) {
		const perfil = req.authSession?.user?.perfil;
		const companyId = req.authSession?.user?.companyId;

		if (perfil !== "admin_empresa") {
			res
				.status(403)
				.json({ message: "Acesso restrito a administradores da empresa." });
			return;
		}

		if (!companyId) {
			res.status(403).json({ message: "Empresa não vinculada." });
			return;
		}

		next();
	}
}

export const requireCompanyAdmin = new RequireCompanyAdminMiddleware();
