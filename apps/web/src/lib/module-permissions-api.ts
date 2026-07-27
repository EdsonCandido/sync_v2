import { apiFetch } from "./api";

export type ModuleKey =
	| "clientes"
	| "financeiro"
	| "itr"
	| "kanban"
	| "usuarios";

export type ModulePermissionItem = {
	moduleKey: ModuleKey;
	canRead: boolean;
	canEdit: boolean;
};

export type MyModulesResponse = {
	modules: ModulePermissionItem[];
};

export type CompanyUserPermissions = {
	userId: string;
	name: string;
	email: string;
	modules: ModulePermissionItem[];
};

export const modulePermissionsApi = {
	me: () => apiFetch<MyModulesResponse>("/api/module-permissions/me"),
	listUsers: () =>
		apiFetch<CompanyUserPermissions[]>("/api/module-permissions/users"),
	upsertUser: (userId: string, modules: ModulePermissionItem[]) =>
		apiFetch<CompanyUserPermissions>(
			`/api/module-permissions/users/${userId}`,
			{
				method: "PUT",
				body: JSON.stringify({ modules }),
			},
		),
};
