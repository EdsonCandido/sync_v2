import type { CompanyDashboardResponse } from "@sync_v2/contracts";
import { apiFetch } from "./api";

export type CompanyDashboard = CompanyDashboardResponse;

export async function fetchCompanyDashboard() {
	return apiFetch<CompanyDashboard>("/api/company-dashboard");
}
