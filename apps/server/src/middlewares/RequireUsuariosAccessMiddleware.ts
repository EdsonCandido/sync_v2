import type { ModuleAction } from "@sync_v2/types";
import type { NextFunction, Request, Response } from "express";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";
import { GetCompanyModulesService } from "../services/GetCompanyModulesService";

/**
 * Acesso ao módulo usuários.
 * Diferente de RequireModuleAccess: super passa (CRUD global).
 * clientes / financeiro / kanban continuam bloqueando super.
 */
export class RequireUsuariosAccessMiddleware {
	constructor(
		private readonly action: ModuleAction,
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
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
				const allowed = await this.getCompanyModulesService.canAccess(
					companyId,
					"usuarios",
				);
				if (!allowed) {
					res.status(403).json({ message: "Sem permissão neste módulo." });
					return;
				}
				next();
				return;
			}

			if (perfil !== "cliente" || !companyId) {
				res.status(403).json({ message: "Sem permissão neste módulo." });
				return;
			}

			const companyAllowed = await this.getCompanyModulesService.canAccess(
				companyId,
				"usuarios",
			);
			if (!companyAllowed) {
				res.status(403).json({ message: "Sem permissão neste módulo." });
				return;
			}

			const grant = await this.modulePermissionRepository.findByUserAndModule(
				userId,
				"usuarios",
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

export function requireUsuariosAccess(action: ModuleAction) {
	return new RequireUsuariosAccessMiddleware(action);
}
