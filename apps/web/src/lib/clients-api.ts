import { apiFetch } from "./api";
import { cepApi, geocodeApi } from "./companies-api";

export type PersonType = "PF" | "PJ";

export type Client = {
	id: string;
	companyId: string;
	personType: PersonType;
	document: string;
	name: string;
	tradeName: string | null;
	email: string;
	phone: string;
	zipCode: string;
	street: string;
	number: string;
	complement: string | null;
	district: string;
	city: string;
	state: string;
	latitude: number | null;
	longitude: number | null;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ClientListResult = {
	items: Client[];
	total: number;
	page: number;
	pageSize: number;
};

export type ClientInput = {
	personType: PersonType;
	document: string;
	name: string;
	tradeName?: string | null;
	email: string;
	phone: string;
	zipCode: string;
	street: string;
	number: string;
	complement?: string | null;
	district: string;
	city: string;
	state: string;
	latitude?: number | null;
	longitude?: number | null;
};

export const clientsApi = {
	list: (params: { q?: string; page?: number; pageSize?: number }) => {
		const search = new URLSearchParams();
		if (params.q) search.set("q", params.q);
		if (params.page) search.set("page", String(params.page));
		if (params.pageSize) search.set("pageSize", String(params.pageSize));
		const qs = search.toString();
		return apiFetch<ClientListResult>(`/api/clients${qs ? `?${qs}` : ""}`);
	},
	get: (id: string) => apiFetch<Client>(`/api/clients/${id}`),
	create: (body: ClientInput) =>
		apiFetch<Client>("/api/clients", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (id: string, body: Partial<ClientInput>) =>
		apiFetch<Client>(`/api/clients/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	remove: (id: string) =>
		apiFetch<Client>(`/api/clients/${id}`, { method: "DELETE" }),
};

export { cepApi, geocodeApi };
