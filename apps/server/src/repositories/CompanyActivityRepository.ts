import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { companyActivities } from "@sync_v2/db/schema/company-dashboard";
import { and, desc, eq } from "drizzle-orm";

export class CompanyActivityRepository {
	async listRecent(companyId: string, limit = 10) {
		return db
			.select({
				id: companyActivities.id,
				action: companyActivities.action,
				occurredAt: companyActivities.createdAt,
				userName: user.name,
			})
			.from(companyActivities)
			.innerJoin(user, eq(companyActivities.userId, user.id))
			.where(
				and(
					eq(companyActivities.companyId, companyId),
					eq(companyActivities.ativo, true),
				),
			)
			.orderBy(desc(companyActivities.createdAt))
			.limit(limit);
	}
}
