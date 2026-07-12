import { db } from "@sync_v2/db";
import { accessEvents } from "@sync_v2/db/schema/company-dashboard";
import { and, count, eq, gte, sql } from "drizzle-orm";

export class AccessEventRepository {
	async create(params: {
		companyId: string;
		userId: string;
		accessedAt?: Date;
	}) {
		const [row] = await db
			.insert(accessEvents)
			.values({
				companyId: params.companyId,
				userId: params.userId,
				accessedAt: params.accessedAt ?? new Date(),
			})
			.returning();
		return row;
	}

	async countBetween(companyId: string, from: Date, to: Date) {
		const [row] = await db
			.select({ value: count() })
			.from(accessEvents)
			.where(
				and(
					eq(accessEvents.companyId, companyId),
					eq(accessEvents.ativo, true),
					gte(accessEvents.accessedAt, from),
					sql`${accessEvents.accessedAt} <= ${to}`,
				),
			);
		return row?.value ?? 0;
	}

	async dailyCounts(companyId: string, from: Date) {
		const rows = await db
			.select({
				date: sql<string>`to_char(date_trunc('day', ${accessEvents.accessedAt}), 'YYYY-MM-DD')`,
				accesses: count(),
			})
			.from(accessEvents)
			.where(
				and(
					eq(accessEvents.companyId, companyId),
					eq(accessEvents.ativo, true),
					gte(accessEvents.accessedAt, from),
				),
			)
			.groupBy(sql`date_trunc('day', ${accessEvents.accessedAt})`)
			.orderBy(sql`date_trunc('day', ${accessEvents.accessedAt})`);

		return rows;
	}
}
