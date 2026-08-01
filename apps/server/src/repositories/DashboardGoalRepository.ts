import type {
	CreateDashboardGoalInput,
	UpdateDashboardGoalInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { dashboardGoals } from "@sync_v2/db/schema/dashboard-widgets";
import { and, asc, eq } from "drizzle-orm";

export class DashboardGoalRepository {
	async listByCompany(companyId: string) {
		return db
			.select()
			.from(dashboardGoals)
			.where(
				and(
					eq(dashboardGoals.companyId, companyId),
					eq(dashboardGoals.ativo, true),
				),
			)
			.orderBy(asc(dashboardGoals.createdAt));
	}

	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(dashboardGoals)
			.where(
				and(
					eq(dashboardGoals.id, id),
					eq(dashboardGoals.companyId, companyId),
					eq(dashboardGoals.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(
		data: CreateDashboardGoalInput & {
			companyId: string;
			createdBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(dashboardGoals)
			.values({
				companyId: data.companyId,
				label: data.label,
				progress: data.progress ?? 0,
				targetLabel: data.targetLabel,
				createdBy: data.createdBy ?? null,
				updatedBy: data.createdBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateDashboardGoalInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(dashboardGoals)
			.set({
				...(data.label !== undefined ? { label: data.label } : {}),
				...(data.progress !== undefined ? { progress: data.progress } : {}),
				...(data.targetLabel !== undefined
					? { targetLabel: data.targetLabel }
					: {}),
				updatedBy: data.updatedBy ?? null,
			})
			.where(
				and(
					eq(dashboardGoals.id, id),
					eq(dashboardGoals.companyId, companyId),
					eq(dashboardGoals.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(dashboardGoals)
			.set({ ativo: false, updatedBy: updatedBy ?? null })
			.where(
				and(
					eq(dashboardGoals.id, id),
					eq(dashboardGoals.companyId, companyId),
					eq(dashboardGoals.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
