import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { companies } from "@sync_v2/db/schema/companies";
import { loginAccessLogs } from "@sync_v2/db/schema/login-access-logs";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";

export class LoginAccessLogRepository {
	async create(params: {
		userId: string;
		companyId: string | null;
		sessionId: string | null;
		ipAddress: string | null;
		userAgent: string | null;
		loggedAt?: Date;
	}) {
		const [row] = await db
			.insert(loginAccessLogs)
			.values({
				userId: params.userId,
				companyId: params.companyId,
				sessionId: params.sessionId,
				ipAddress: params.ipAddress,
				userAgent: params.userAgent,
				loggedAt: params.loggedAt ?? new Date(),
			})
			.returning({ id: loginAccessLogs.id });
		return row;
	}

	async updateGeo(
		id: string,
		geo: { country: string | null; region: string | null; city: string | null },
	) {
		await db
			.update(loginAccessLogs)
			.set({
				country: geo.country,
				region: geo.region,
				city: geo.city,
			})
			.where(eq(loginAccessLogs.id, id));
	}

	async findGeoBySessionIds(sessionIds: string[]) {
		if (sessionIds.length === 0) return [];
		return db
			.select({
				sessionId: loginAccessLogs.sessionId,
				country: loginAccessLogs.country,
				region: loginAccessLogs.region,
				city: loginAccessLogs.city,
			})
			.from(loginAccessLogs)
			.where(
				and(
					eq(loginAccessLogs.ativo, true),
					inArray(loginAccessLogs.sessionId, sessionIds),
				),
			)
			.orderBy(desc(loginAccessLogs.loggedAt));
	}

	async listHistory(params: { q?: string; page: number; pageSize: number }) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();

		const conditions = [eq(loginAccessLogs.ativo, true)];
		if (search) {
			const searchFilter = or(
				ilike(user.name, `%${search}%`),
				ilike(user.email, `%${search}%`),
				ilike(user.perfil, `%${search}%`),
				ilike(companies.tradeName, `%${search}%`),
				ilike(loginAccessLogs.ipAddress, `%${search}%`),
				ilike(loginAccessLogs.city, `%${search}%`),
				ilike(loginAccessLogs.region, `%${search}%`),
				ilike(loginAccessLogs.country, `%${search}%`),
			);
			if (searchFilter) {
				conditions.push(searchFilter);
			}
		}

		const where = and(...conditions);

		const [items, totalRow] = await Promise.all([
			db
				.select({
					id: loginAccessLogs.id,
					userId: loginAccessLogs.userId,
					userName: user.name,
					userEmail: user.email,
					perfil: user.perfil,
					companyId: loginAccessLogs.companyId,
					companyName: companies.tradeName,
					ipAddress: loginAccessLogs.ipAddress,
					userAgent: loginAccessLogs.userAgent,
					country: loginAccessLogs.country,
					region: loginAccessLogs.region,
					city: loginAccessLogs.city,
					loggedAt: loginAccessLogs.loggedAt,
				})
				.from(loginAccessLogs)
				.innerJoin(user, eq(loginAccessLogs.userId, user.id))
				.leftJoin(companies, eq(loginAccessLogs.companyId, companies.id))
				.where(where)
				.orderBy(desc(loginAccessLogs.loggedAt))
				.limit(params.pageSize)
				.offset(offset),
			db
				.select({ value: count() })
				.from(loginAccessLogs)
				.innerJoin(user, eq(loginAccessLogs.userId, user.id))
				.leftJoin(companies, eq(loginAccessLogs.companyId, companies.id))
				.where(where),
		]);

		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}
}
