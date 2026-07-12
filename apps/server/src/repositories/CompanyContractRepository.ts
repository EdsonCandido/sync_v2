import { db } from "@sync_v2/db";
import { companyContracts } from "@sync_v2/db/schema/company-dashboard";
import { and, asc, eq, gte, lte } from "drizzle-orm";

export class CompanyContractRepository {
	async listExpiringSoon(companyId: string, withinDays: number, limit = 10) {
		const now = new Date();
		const until = new Date();
		until.setDate(until.getDate() + withinDays);

		return db
			.select({
				id: companyContracts.id,
				title: companyContracts.title,
				expiresAt: companyContracts.expiresAt,
			})
			.from(companyContracts)
			.where(
				and(
					eq(companyContracts.companyId, companyId),
					eq(companyContracts.ativo, true),
					gte(companyContracts.expiresAt, now),
					lte(companyContracts.expiresAt, until),
				),
			)
			.orderBy(asc(companyContracts.expiresAt))
			.limit(limit);
	}
}
