import { db } from "@sync_v2/db";
import { companyRequests } from "@sync_v2/db/schema/company-dashboard";
import { and, count, desc, eq } from "drizzle-orm";

export class CompanyRequestRepository {
	async countPending(companyId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(companyRequests)
			.where(
				and(
					eq(companyRequests.companyId, companyId),
					eq(companyRequests.ativo, true),
					eq(companyRequests.status, "pending"),
				),
			);
		return row?.value ?? 0;
	}

	async listPending(companyId: string, limit = 10) {
		return db
			.select({
				id: companyRequests.id,
				title: companyRequests.title,
				createdAt: companyRequests.createdAt,
			})
			.from(companyRequests)
			.where(
				and(
					eq(companyRequests.companyId, companyId),
					eq(companyRequests.ativo, true),
					eq(companyRequests.status, "pending"),
				),
			)
			.orderBy(desc(companyRequests.createdAt))
			.limit(limit);
	}
}
