import { apiFetch } from "./api";

export type Plan = {
	id: string;
	name: string;
	description: string | null;
	startDate: string;
	endDate: string;
	ativo: boolean;
	createdAt?: string;
	updatedAt?: string;
};

export type PlanInput = {
	name: string;
	description?: string | null;
	startDate: string;
	endDate: string;
};

export type PlanListResult = {
	items: Plan[];
	total: number;
	page: number;
	pageSize: number;
};

export const plansApi = {
	list: (params: { q?: string; page?: number; pageSize?: number }) => {
		const search = new URLSearchParams();
		if (params.q) search.set("q", params.q);
		if (params.page) search.set("page", String(params.page));
		if (params.pageSize) search.set("pageSize", String(params.pageSize));
		const qs = search.toString();
		return apiFetch<PlanListResult>(`/api/plans${qs ? `?${qs}` : ""}`);
	},
	options: () => apiFetch<Plan[]>("/api/plans/options"),
	get: (id: string) => apiFetch<Plan>(`/api/plans/${id}`),
	create: (body: PlanInput) =>
		apiFetch<Plan>("/api/plans", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (id: string, body: Partial<PlanInput>) =>
		apiFetch<Plan>(`/api/plans/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	remove: (id: string) =>
		apiFetch<Plan>(`/api/plans/${id}`, { method: "DELETE" }),
};
