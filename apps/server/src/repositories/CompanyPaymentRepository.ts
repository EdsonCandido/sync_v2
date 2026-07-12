import { db } from "@sync_v2/db";
import { companyPayments } from "@sync_v2/db/schema/company-dashboard";
import { and, asc, eq } from "drizzle-orm";

export class CompanyPaymentRepository {
	async listPending(companyId: string, limit = 10) {
		return db
			.select({
				id: companyPayments.id,
				description: companyPayments.description,
				amount: companyPayments.amount,
				dueDate: companyPayments.dueDate,
			})
			.from(companyPayments)
			.where(
				and(
					eq(companyPayments.companyId, companyId),
					eq(companyPayments.ativo, true),
					eq(companyPayments.status, "pending"),
				),
			)
			.orderBy(asc(companyPayments.dueDate))
			.limit(limit);
	}
}
