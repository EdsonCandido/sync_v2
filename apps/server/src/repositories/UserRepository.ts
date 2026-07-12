import { db } from "@sync_v2/db";
import { account, user } from "@sync_v2/db/schema/auth";
import { companies } from "@sync_v2/db/schema/companies";
import {
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	isNull,
	lt,
	lte,
	or,
	sql,
} from "drizzle-orm";

export type UserListItem = {
	id: string;
	name: string;
	email: string;
	perfil: string;
	companyId: string | null;
	companyName: string | null;
	department: string | null;
	ativo: boolean;
	blocked: boolean;
	lastAccessAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string | null;
	updatedBy: string | null;
};

export class UserRepository {
	async findById(id: string) {
		const [row] = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				perfil: user.perfil,
				companyId: user.companyId,
				companyName: companies.tradeName,
				department: user.department,
				ativo: user.ativo,
				blocked: user.blocked,
				lastAccessAt: user.lastAccessAt,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				createdBy: user.createdBy,
				updatedBy: user.updatedBy,
			})
			.from(user)
			.leftJoin(companies, eq(user.companyId, companies.id))
			.where(eq(user.id, id))
			.limit(1);
		return (row as UserListItem | undefined) ?? null;
	}

	async findByEmail(email: string, excludeId?: string) {
		const conditions = [eq(user.email, email.toLowerCase())];
		if (excludeId) {
			conditions.push(sql`${user.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(user)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async list(params: {
		q?: string;
		page: number;
		pageSize: number;
		companyId?: string | null;
	}) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();

		const conditions = [];
		if (params.companyId) {
			conditions.push(eq(user.companyId, params.companyId));
		}
		if (search) {
			conditions.push(
				or(
					ilike(user.name, `%${search}%`),
					ilike(user.email, `%${search}%`),
					ilike(user.perfil, `%${search}%`),
					ilike(companies.tradeName, `%${search}%`),
				),
			);
		}

		const where = conditions.length > 0 ? and(...conditions) : undefined;

		const [items, totalRow] = await Promise.all([
			db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					perfil: user.perfil,
					companyId: user.companyId,
					companyName: companies.tradeName,
					department: user.department,
					ativo: user.ativo,
					blocked: user.blocked,
					lastAccessAt: user.lastAccessAt,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					createdBy: user.createdBy,
					updatedBy: user.updatedBy,
				})
				.from(user)
				.leftJoin(companies, eq(user.companyId, companies.id))
				.where(where)
				.orderBy(desc(user.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db
				.select({ value: count() })
				.from(user)
				.leftJoin(companies, eq(user.companyId, companies.id))
				.where(where),
		]);

		return {
			items: items as UserListItem[],
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async updateDomain(
		id: string,
		data: {
			name?: string;
			email?: string;
			perfil?: string;
			companyId?: string | null;
			department?: string | null;
			ativo?: boolean;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.update(user)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(user.id, id))
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, updatedBy?: string | null) {
		const [row] = await db
			.update(user)
			.set({
				ativo: false,
				updatedBy: updatedBy ?? null,
				updatedAt: new Date(),
			})
			.where(eq(user.id, id))
			.returning();
		return row ?? null;
	}

	async updateCredentialPassword(userId: string, passwordHash: string) {
		const [existing] = await db
			.select()
			.from(account)
			.where(
				and(eq(account.userId, userId), eq(account.providerId, "credential")),
			)
			.limit(1);

		if (existing) {
			const [row] = await db
				.update(account)
				.set({
					password: passwordHash,
					updatedAt: new Date(),
				})
				.where(eq(account.id, existing.id))
				.returning();
			return row ?? null;
		}

		const [row] = await db
			.insert(account)
			.values({
				accountId: userId,
				providerId: "credential",
				userId,
				password: passwordHash,
			})
			.returning();
		return row ?? null;
	}

	async countRegistered(companyId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(user)
			.where(and(eq(user.companyId, companyId), eq(user.ativo, true)));
		return row?.value ?? 0;
	}

	async countActive(companyId: string) {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [row] = await db
			.select({ value: count() })
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					eq(user.blocked, false),
					gte(user.lastAccessAt, thirtyDaysAgo),
				),
			);
		return row?.value ?? 0;
	}

	async countBlocked(companyId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					eq(user.blocked, true),
				),
			);
		return row?.value ?? 0;
	}

	async countInactiveOverDays(companyId: string, days: number) {
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - days);

		const [row] = await db
			.select({ value: count() })
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					eq(user.blocked, false),
					or(isNull(user.lastAccessAt), lt(user.lastAccessAt, cutoff)),
				),
			);
		return row?.value ?? 0;
	}

	async listBlocked(companyId: string, limit = 10) {
		return db
			.select({
				id: user.id,
				name: user.name,
			})
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					eq(user.blocked, true),
				),
			)
			.limit(limit);
	}

	async listInactiveOverDays(companyId: string, days: number, limit = 10) {
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - days);

		return db
			.select({
				id: user.id,
				name: user.name,
				lastAccessAt: user.lastAccessAt,
			})
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					eq(user.blocked, false),
					or(isNull(user.lastAccessAt), lt(user.lastAccessAt, cutoff)),
				),
			)
			.limit(limit);
	}

	async countCreatedBetween(companyId: string, from: Date, to: Date) {
		const [row] = await db
			.select({ value: count() })
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.ativo, true),
					gte(user.createdAt, from),
					lte(user.createdAt, to),
				),
			);
		return row?.value ?? 0;
	}

	async departmentDistribution(companyId: string) {
		return db
			.select({
				department: sql<string>`coalesce(${user.department}, 'Sem departamento')`,
				count: count(),
			})
			.from(user)
			.where(and(eq(user.companyId, companyId), eq(user.ativo, true)))
			.groupBy(sql`coalesce(${user.department}, 'Sem departamento')`);
	}

	async updateLastAccess(userId: string, at: Date) {
		await db
			.update(user)
			.set({
				lastAccessAt: at,
				updatedAt: new Date(),
			})
			.where(eq(user.id, userId));
	}
}
