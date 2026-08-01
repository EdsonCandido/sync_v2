import { db } from "@sync_v2/db";
import { dashboardWidgetLayouts } from "@sync_v2/db/schema/dashboard-widgets";
import { and, eq } from "drizzle-orm";

export class DashboardWidgetLayoutRepository {
	async findByUser(companyId: string, userId: string) {
		const [row] = await db
			.select()
			.from(dashboardWidgetLayouts)
			.where(
				and(
					eq(dashboardWidgetLayouts.companyId, companyId),
					eq(dashboardWidgetLayouts.userId, userId),
					eq(dashboardWidgetLayouts.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async upsert(params: {
		companyId: string;
		userId: string;
		widgetOrder: string;
		updatedBy?: string | null;
	}) {
		const existing = await this.findByUser(params.companyId, params.userId);
		if (existing) {
			const [row] = await db
				.update(dashboardWidgetLayouts)
				.set({
					widgetOrder: params.widgetOrder,
					updatedBy: params.updatedBy ?? null,
				})
				.where(eq(dashboardWidgetLayouts.id, existing.id))
				.returning();
			return row;
		}
		const [row] = await db
			.insert(dashboardWidgetLayouts)
			.values({
				companyId: params.companyId,
				userId: params.userId,
				widgetOrder: params.widgetOrder,
				createdBy: params.updatedBy ?? null,
				updatedBy: params.updatedBy ?? null,
			})
			.returning();
		return row;
	}
}
