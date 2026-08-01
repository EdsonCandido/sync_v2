import type {
	DashboardWidgetsResponse,
	UpdateDashboardWidgetLayoutInput,
} from "@sync_v2/contracts";
import { apiFetch } from "./api";

export type CompanyDashboard =
	import("@sync_v2/contracts").CompanyDashboardResponse;

export type DashboardWidgets = DashboardWidgetsResponse;

export async function fetchCompanyDashboard() {
	return apiFetch<CompanyDashboard>("/api/company-dashboard");
}

export async function fetchDashboardWidgets() {
	return apiFetch<DashboardWidgets>("/api/company-dashboard/widgets");
}

export async function updateDashboardWidgetLayout(
	body: UpdateDashboardWidgetLayoutInput,
) {
	return apiFetch<{ widgetOrder: string[] }>(
		"/api/company-dashboard/widgets/layout",
		{
			method: "PUT",
			body: JSON.stringify(body),
		},
	);
}

export async function createDashboardFavorite(body: {
	label: string;
	path: string;
	sortOrder?: number;
}) {
	return apiFetch("/api/company-dashboard/widgets/favorites", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function softDeleteDashboardFavorite(id: string) {
	return apiFetch(`/api/company-dashboard/widgets/favorites/${id}`, {
		method: "DELETE",
	});
}

export async function createDashboardGoal(body: {
	label: string;
	progress?: number;
	targetLabel: string;
}) {
	return apiFetch("/api/company-dashboard/widgets/goals", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function updateDashboardGoal(
	id: string,
	body: { label?: string; progress?: number; targetLabel?: string },
) {
	return apiFetch(`/api/company-dashboard/widgets/goals/${id}`, {
		method: "PUT",
		body: JSON.stringify(body),
	});
}

export async function softDeleteDashboardGoal(id: string) {
	return apiFetch(`/api/company-dashboard/widgets/goals/${id}`, {
		method: "DELETE",
	});
}
