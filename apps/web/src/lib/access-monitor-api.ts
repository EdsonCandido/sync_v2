import { apiFetch } from "./api";

export type AccessMonitorRow = {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	perfil: "super" | "admin_empresa" | "cliente";
	companyId: string | null;
	companyName: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	country: string | null;
	region: string | null;
	city: string | null;
};

export type ActiveSession = AccessMonitorRow & {
	expiresAt: string;
	createdAt: string;
};

export type LoginAccessHistoryItem = AccessMonitorRow & {
	loggedAt: string;
};

export type ActiveSessionsResult = {
	items: ActiveSession[];
	total: number;
};

export type LoginAccessHistoryResult = {
	items: LoginAccessHistoryItem[];
	total: number;
	page: number;
	pageSize: number;
};

export const accessMonitorApi = {
	sessions: () =>
		apiFetch<ActiveSessionsResult>("/api/access-monitor/sessions"),
	history: (params: { q?: string; page?: number; pageSize?: number }) => {
		const search = new URLSearchParams();
		if (params.q) search.set("q", params.q);
		if (params.page) search.set("page", String(params.page));
		if (params.pageSize) search.set("pageSize", String(params.pageSize));
		const qs = search.toString();
		return apiFetch<LoginAccessHistoryResult>(
			`/api/access-monitor/history${qs ? `?${qs}` : ""}`,
		);
	},
};
