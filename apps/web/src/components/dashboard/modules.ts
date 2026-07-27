import type { IconType } from "react-icons";
import {
	LuBadgeDollarSign,
	LuBuilding2,
	LuClipboardList,
	LuHouse,
	LuKanban,
	LuShield,
	LuUsers,
	LuWallet,
} from "react-icons/lu";

import { ReceitaFederalIcon } from "@/components/icons/ReceitaFederalIcon";
import type { ModuleKey } from "@/lib/module-permissions-api";

export type DashboardModule = {
	id: string;
	label: string;
	path: string;
	icon: IconType;
	end?: boolean;
	/** Só super */
	superOnly?: boolean;
	/** Módulo company com grant */
	moduleKey?: ModuleKey;
	/** Só admin_empresa */
	adminOnly?: boolean;
	/** Super também vê este moduleKey (ex.: usuarios) */
	allowSuper?: boolean;
};

export const DASHBOARD_MODULES: DashboardModule[] = [
	{
		id: "home",
		label: "Início",
		path: "/dashboard",
		icon: LuHouse,
		end: true,
	},
	{
		id: "clientes",
		label: "Clientes",
		path: "/dashboard/clientes",
		icon: LuClipboardList,
		moduleKey: "clientes",
	},
	{
		id: "itr",
		label: "ITR",
		path: "/dashboard/itr",
		icon: ReceitaFederalIcon,
		moduleKey: "itr",
	},
	{
		id: "kanban",
		label: "Kanban",
		path: "/dashboard/kanban",
		icon: LuKanban,
		moduleKey: "kanban",
	},
	{
		id: "financeiro",
		label: "Financeiro",
		path: "/dashboard/financeiro",
		icon: LuWallet,
		moduleKey: "financeiro",
	},
	{
		id: "usuarios",
		label: "Usuários",
		path: "/dashboard/usuarios",
		icon: LuUsers,
		moduleKey: "usuarios",
		allowSuper: true,
	},
	{
		id: "permissoes",
		label: "Permissões",
		path: "/dashboard/permissoes",
		icon: LuShield,
		adminOnly: true,
	},
	{
		id: "empresas",
		label: "Empresas",
		path: "/dashboard/empresas",
		icon: LuBuilding2,
		superOnly: true,
	},
	{
		id: "planos",
		label: "Planos",
		path: "/dashboard/planos",
		icon: LuBadgeDollarSign,
		superOnly: true,
	},
];

export function getVisibleModules(params: {
	perfil?: string | null;
	canReadModule: (key: ModuleKey) => boolean;
}) {
	const { perfil, canReadModule } = params;

	return DASHBOARD_MODULES.filter((mod) => {
		if (mod.superOnly) {
			return perfil === "super";
		}
		if (mod.adminOnly) {
			return perfil === "admin_empresa";
		}
		if (mod.moduleKey) {
			if (perfil === "super") {
				return Boolean(mod.allowSuper) && canReadModule(mod.moduleKey);
			}
			return canReadModule(mod.moduleKey);
		}
		return true;
	});
}
