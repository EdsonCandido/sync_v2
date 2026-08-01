import type {
	CreateDashboardFavoriteInput,
	UpdateDashboardFavoriteInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { dashboardFavorites } from "@sync_v2/db/schema/dashboard-widgets";
import { and, asc, eq } from "drizzle-orm";

export class DashboardFavoriteRepository {
	async listByUser(companyId: string, userId: string) {
		return db
			.select()
			.from(dashboardFavorites)
			.where(
				and(
					eq(dashboardFavorites.companyId, companyId),
					eq(dashboardFavorites.userId, userId),
					eq(dashboardFavorites.ativo, true),
				),
			)
			.orderBy(asc(dashboardFavorites.sortOrder));
	}

	async findById(id: string, companyId: string, userId: string) {
		const [row] = await db
			.select()
			.from(dashboardFavorites)
			.where(
				and(
					eq(dashboardFavorites.id, id),
					eq(dashboardFavorites.companyId, companyId),
					eq(dashboardFavorites.userId, userId),
					eq(dashboardFavorites.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(
		data: CreateDashboardFavoriteInput & {
			companyId: string;
			userId: string;
			createdBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(dashboardFavorites)
			.values({
				companyId: data.companyId,
				userId: data.userId,
				label: data.label,
				path: data.path,
				sortOrder: data.sortOrder ?? 0,
				createdBy: data.createdBy ?? null,
				updatedBy: data.createdBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		userId: string,
		data: UpdateDashboardFavoriteInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(dashboardFavorites)
			.set({
				...(data.label !== undefined ? { label: data.label } : {}),
				...(data.path !== undefined ? { path: data.path } : {}),
				...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
				updatedBy: data.updatedBy ?? null,
			})
			.where(
				and(
					eq(dashboardFavorites.id, id),
					eq(dashboardFavorites.companyId, companyId),
					eq(dashboardFavorites.userId, userId),
					eq(dashboardFavorites.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(
		id: string,
		companyId: string,
		userId: string,
		updatedBy?: string | null,
	) {
		const [row] = await db
			.update(dashboardFavorites)
			.set({ ativo: false, updatedBy: updatedBy ?? null })
			.where(
				and(
					eq(dashboardFavorites.id, id),
					eq(dashboardFavorites.companyId, companyId),
					eq(dashboardFavorites.userId, userId),
					eq(dashboardFavorites.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
