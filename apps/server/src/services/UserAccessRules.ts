import type { UserPerfil } from "@sync_v2/types";
import type { UserListItem } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";

export type ActorContext = {
	actorId: string;
	actorPerfil: string;
	actorCompanyId: string | null | undefined;
};

export function isAdminOrSuper(perfil: string) {
	return perfil === "super" || perfil === "admin_empresa";
}

export function resolveListCompanyScope(actor: ActorContext): string | null {
	if (actor.actorPerfil === "super") {
		return null;
	}
	if (!actor.actorCompanyId) {
		throw new AppError(403, "Empresa não vinculada.");
	}
	return actor.actorCompanyId;
}

export function assertCanManageTarget(
	actor: ActorContext,
	target: UserListItem,
	opts?: { allowPasswordOrAtivo?: boolean },
) {
	if (actor.actorPerfil === "super") {
		return;
	}

	if (!actor.actorCompanyId || target.companyId !== actor.actorCompanyId) {
		throw new AppError(403, "Usuário fora do escopo da empresa.");
	}

	if (actor.actorPerfil === "admin_empresa") {
		if (target.perfil !== "cliente" && target.perfil !== "admin_empresa") {
			throw new AppError(403, "Sem permissão para este usuário.");
		}
		return;
	}

	if (actor.actorPerfil === "cliente") {
		if (opts?.allowPasswordOrAtivo) {
			throw new AppError(403, "Sem permissão para alterar senha ou status.");
		}
		if (target.perfil !== "cliente") {
			throw new AppError(403, "Sem permissão para este usuário.");
		}
		return;
	}

	throw new AppError(403, "Sem permissão.");
}

export function assertCanCreatePerfil(
	actor: ActorContext,
	perfil: UserPerfil,
	companyId: string | null | undefined,
): string | null {
	if (actor.actorPerfil === "super") {
		if (perfil === "super") {
			return null;
		}
		if (!companyId) {
			throw new AppError(400, "Empresa obrigatória para este perfil.");
		}
		return companyId;
	}

	if (actor.actorPerfil === "admin_empresa") {
		if (perfil !== "cliente") {
			throw new AppError(403, "Admin só pode criar usuários cliente.");
		}
		if (!actor.actorCompanyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return actor.actorCompanyId;
	}

	if (actor.actorPerfil === "cliente") {
		if (perfil !== "cliente") {
			throw new AppError(403, "Só é permitido criar usuários cliente.");
		}
		if (!actor.actorCompanyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}
		return actor.actorCompanyId;
	}

	throw new AppError(403, "Sem permissão.");
}

export function assertCanUpdateFields(
	actor: ActorContext,
	target: UserListItem,
	input: {
		perfil?: UserPerfil;
		companyId?: string | null;
		password?: string;
		ativo?: boolean;
	},
) {
	assertCanManageTarget(actor, target);

	if (actor.actorPerfil === "super") {
		return;
	}

	if (input.password !== undefined || input.ativo !== undefined) {
		if (!isAdminOrSuper(actor.actorPerfil)) {
			throw new AppError(403, "Sem permissão para alterar senha ou status.");
		}
	}

	if (actor.actorPerfil === "admin_empresa") {
		if (input.companyId !== undefined && input.companyId !== target.companyId) {
			throw new AppError(403, "Empresa não pode ser alterada.");
		}
		if (input.perfil !== undefined) {
			if (input.perfil !== "cliente" && input.perfil !== "admin_empresa") {
				throw new AppError(403, "Perfil inválido para admin da empresa.");
			}
			if (target.perfil === "admin_empresa" && input.perfil === "cliente") {
				// allowed: demote admin to cliente within company
			}
			if (target.perfil === "cliente" && input.perfil === "admin_empresa") {
				throw new AppError(403, "Admin não pode promover usuário a admin.");
			}
		}
		return;
	}

	if (actor.actorPerfil === "cliente") {
		if (input.password !== undefined || input.ativo !== undefined) {
			throw new AppError(403, "Sem permissão para alterar senha ou status.");
		}
		if (input.companyId !== undefined && input.companyId !== target.companyId) {
			throw new AppError(403, "Empresa não pode ser alterada.");
		}
		if (input.perfil !== undefined && input.perfil !== "cliente") {
			throw new AppError(403, "Perfil inválido.");
		}
	}
}
