import type { ModuleAction, ModuleKey } from "@sync_v2/types";
import type { NextFunction, Request, Response } from "express";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";

export class RequireModuleAccessMiddleware {
	constructor(
		private readonly moduleKey: ModuleKey,
		private readonly action: ModuleAction,
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
	) {}

	handle = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const perfil = req.authSession?.user?.perfil;
			const companyId = req.authSession?.user?.companyId;
			const userId = req.authSession?.user?.id;

			if (!userId) {
				res.status(401).json({ message: "Não autenticado." });
				return;
			}

			if (perfil === "super") {
				res.status(403).json({
					message: "Acesso restrito a usuários da empresa.",
				});
				return;
			}

			if (perfil === "admin_empresa") {
				if (!companyId) {
					res.status(403).json({ message: "Empresa não vinculada." });
					return;
				}
				next();
				return;
			}

			if (perfil !== "cliente" || !companyId) {
				res.status(403).json({ message: "Sem permissão neste módulo." });
				return;
			}

			const grant = await this.modulePermissionRepository.findByUserAndModule(
				userId,
				this.moduleKey,
			);

			if (!grant?.ativo) {
				res.status(403).json({ message: "Sem permissão neste módulo." });
				return;
			}

			if (this.action === "edit") {
				if (!grant.canEdit) {
					res.status(403).json({ message: "Sem permissão de edição." });
					return;
				}
			} else if (!(grant.canRead || grant.canEdit)) {
				res.status(403).json({ message: "Sem permissão neste módulo." });
				return;
			}

			next();
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Erro interno." });
		}
	};
}

export function requireModuleAccess(
	moduleKey: ModuleKey,
	action: ModuleAction,
) {
	return new RequireModuleAccessMiddleware(moduleKey, action);
}

/** CEP/geocode: super (empresas) OU edit no módulo clientes. */
export class RequireCepGeocodeAccessMiddleware {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
	) {}

	handle = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const perfil = req.authSession?.user?.perfil;
			const companyId = req.authSession?.user?.companyId;
			const userId = req.authSession?.user?.id;

			if (!userId) {
				res.status(401).json({ message: "Não autenticado." });
				return;
			}

			if (perfil === "super") {
				next();
				return;
			}

			if (perfil === "admin_empresa") {
				if (!companyId) {
					res.status(403).json({ message: "Empresa não vinculada." });
					return;
				}
				next();
				return;
			}

			if (perfil !== "cliente" || !companyId) {
				res.status(403).json({ message: "Sem permissão." });
				return;
			}

			const grantClientes =
				await this.modulePermissionRepository.findByUserAndModule(
					userId,
					"clientes",
				);
			const grantItr =
				await this.modulePermissionRepository.findByUserAndModule(
					userId,
					"itr",
				);

			const canEditClientes = Boolean(
				grantClientes?.ativo && grantClientes.canEdit,
			);
			const canEditItr = Boolean(grantItr?.ativo && grantItr.canEdit);

			if (!canEditClientes && !canEditItr) {
				res
					.status(403)
					.json({ message: "Sem permissão de edição em clientes ou ITR." });
				return;
			}

			next();
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Erro interno." });
		}
	};
}

export const requireCepGeocodeAccess = new RequireCepGeocodeAccessMiddleware();
