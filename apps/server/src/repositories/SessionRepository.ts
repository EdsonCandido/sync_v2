import { db } from "@sync_v2/db";
import { session, user } from "@sync_v2/db/schema/auth";
import { companies } from "@sync_v2/db/schema/companies";
import { and, count, desc, eq, gt } from "drizzle-orm";

export type ActiveSessionRow = {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	perfil: string;
	companyId: string | null;
	companyName: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	expiresAt: Date;
	createdAt: Date;
};

export class SessionRepository {
	async findIdByToken(token: string) {
		const [row] = await db
			.select({ id: session.id })
			.from(session)
			.where(and(eq(session.token, token), eq(session.ativo, true)))
			.limit(1);
		return row?.id ?? null;
	}

	async listActive(): Promise<ActiveSessionRow[]> {
		const now = new Date();
		const rows = await db
			.select({
				id: session.id,
				userId: session.userId,
				userName: user.name,
				userEmail: user.email,
				perfil: user.perfil,
				companyId: user.companyId,
				companyName: companies.tradeName,
				ipAddress: session.ipAddress,
				userAgent: session.userAgent,
				expiresAt: session.expiresAt,
				createdAt: session.createdAt,
			})
			.from(session)
			.innerJoin(user, eq(session.userId, user.id))
			.leftJoin(companies, eq(user.companyId, companies.id))
			.where(and(eq(session.ativo, true), gt(session.expiresAt, now)))
			.orderBy(desc(session.createdAt));
		return rows;
	}

	async countActive() {
		const now = new Date();
		const [row] = await db
			.select({ value: count() })
			.from(session)
			.where(and(eq(session.ativo, true), gt(session.expiresAt, now)));
		return row?.value ?? 0;
	}
}
