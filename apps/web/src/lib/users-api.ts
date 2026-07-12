import { apiFetch } from "./api";

export type UserPerfil = "super" | "admin_empresa" | "cliente";

export type AppUser = {
	id: string;
	name: string;
	email: string;
	perfil: UserPerfil;
	companyId: string | null;
	companyName?: string | null;
	department: string | null;
	ativo: boolean;
	blocked: boolean;
	lastAccessAt: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string | null;
	updatedBy: string | null;
};

export type UserListResult = {
	items: AppUser[];
	total: number;
	page: number;
	pageSize: number;
};

export type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	perfil: UserPerfil;
	companyId?: string | null;
	department?: string | null;
	ativo?: boolean;
};

export type UpdateUserInput = {
	name?: string;
	email?: string;
	password?: string;
	perfil?: UserPerfil;
	companyId?: string | null;
	department?: string | null;
	ativo?: boolean;
};

export const usersApi = {
	list: (params: {
		q?: string;
		page?: number;
		pageSize?: number;
		companyId?: string;
	}) => {
		const search = new URLSearchParams();
		if (params.q) search.set("q", params.q);
		if (params.page) search.set("page", String(params.page));
		if (params.pageSize) search.set("pageSize", String(params.pageSize));
		if (params.companyId) search.set("companyId", params.companyId);
		const qs = search.toString();
		return apiFetch<UserListResult>(`/api/users${qs ? `?${qs}` : ""}`);
	},
	get: (id: string) => apiFetch<AppUser>(`/api/users/${id}`),
	create: (body: CreateUserInput) =>
		apiFetch<AppUser>("/api/users", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (id: string, body: UpdateUserInput) =>
		apiFetch<AppUser>(`/api/users/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	remove: (id: string) =>
		apiFetch<AppUser>(`/api/users/${id}`, { method: "DELETE" }),
	adminSetPassword: (id: string, password: string) =>
		apiFetch<{ ok: true }>(`/api/users/${id}/password`, {
			method: "PATCH",
			body: JSON.stringify({ password }),
		}),
	changeOwnPassword: (currentPassword: string, newPassword: string) =>
		apiFetch<{ ok: true }>("/api/users/me/password", {
			method: "POST",
			body: JSON.stringify({ currentPassword, newPassword }),
		}),
};
