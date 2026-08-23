import { apiFetch } from "./api";

export type Company = {
	id: string;
	corporateName: string;
	tradeName: string;
	document: string;
	email: string;
	phone: string;
	website: string | null;
	logo: string | null;
	zipCode: string;
	street: string;
	number: string;
	complement: string | null;
	district: string;
	city: string;
	state: string;
	latitude: number | null;
	longitude: number | null;
	planId: string;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CompanyListResult = {
	items: Company[];
	total: number;
	page: number;
	pageSize: number;
};

export type CompanyInput = {
	corporateName: string;
	tradeName: string;
	document: string;
	email: string;
	phone: string;
	website?: string | null;
	logo?: string | null;
	zipCode: string;
	street: string;
	number: string;
	complement?: string | null;
	district: string;
	city: string;
	state: string;
	latitude?: number | null;
	longitude?: number | null;
	planId: string;
};

export type ModuleKey =
	| "clientes"
	| "financeiro"
	| "itr"
	| "kanban"
	| "agendamentos"
	| "usuarios";

export type CompanyModulePermissionItem = {
	moduleKey: ModuleKey;
	canAccess: boolean;
	canLiberate: boolean;
};

export type CompanyModulesResponse = {
	modules: CompanyModulePermissionItem[];
};

export type CepResult = {
	zipCode: string;
	street: string;
	district: string;
	city: string;
	state: string;
};

export type GeocodeResult = {
	latitude: number;
	longitude: number;
};

export const companiesApi = {
	list: (params: { q?: string; page?: number; pageSize?: number }) => {
		const search = new URLSearchParams();
		if (params.q) search.set("q", params.q);
		if (params.page) search.set("page", String(params.page));
		if (params.pageSize) search.set("pageSize", String(params.pageSize));
		const qs = search.toString();
		return apiFetch<CompanyListResult>(`/api/companies${qs ? `?${qs}` : ""}`);
	},
	get: (id: string) => apiFetch<Company>(`/api/companies/${id}`),
	create: (body: CompanyInput) =>
		apiFetch<Company>("/api/companies", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (id: string, body: Partial<CompanyInput>) =>
		apiFetch<Company>(`/api/companies/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	remove: (id: string) =>
		apiFetch<Company>(`/api/companies/${id}`, { method: "DELETE" }),
	getModules: (companyId: string) =>
		apiFetch<CompanyModulesResponse>(`/api/companies/${companyId}/modules`),
	upsertModules: (companyId: string, modules: CompanyModulePermissionItem[]) =>
		apiFetch<CompanyModulesResponse>(`/api/companies/${companyId}/modules`, {
			method: "PUT",
			body: JSON.stringify({ modules }),
		}),
};

export { type Plan, plansApi } from "./plans-api";

export const cepApi = {
	lookup: (cep: string) =>
		apiFetch<CepResult>(`/api/cep/${cep.replace(/\D/g, "")}`),
};

export const geocodeApi = {
	lookup: (body: {
		zipCode: string;
		street: string;
		number: string;
		district: string;
		city: string;
		state: string;
	}) =>
		apiFetch<GeocodeResult>("/api/geocode", {
			method: "POST",
			body: JSON.stringify(body),
		}),
};
