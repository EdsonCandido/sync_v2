import type { CreatePlanInput, UpdatePlanInput } from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { companies } from "@sync_v2/db/schema/companies";
import { plans } from "@sync_v2/db/schema/plans";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export class PlanRepository {
	async findById(id: string) {
		const [row] = await db
			.select()
			.from(plans)
			.where(and(eq(plans.id, id), eq(plans.ativo, true)))
			.limit(1);
		return row ?? null;
	}

	async findByIdAny(id: string) {
		const [row] = await db
			.select()
			.from(plans)
			.where(eq(plans.id, id))
			.limit(1);
		return row ?? null;
	}

	async findByName(name: string, excludeId?: string) {
		const conditions = [eq(plans.name, name), eq(plans.ativo, true)];
		if (excludeId) {
			conditions.push(sql`${plans.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(plans)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async listActive() {
		return db
			.select()
			.from(plans)
			.where(eq(plans.ativo, true))
			.orderBy(desc(plans.createdAt));
	}

	async list(params: { q?: string; page: number; pageSize: number }) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();

		const where = search
			? and(
					eq(plans.ativo, true),
					or(
						ilike(plans.name, `%${search}%`),
						ilike(plans.description, `%${search}%`),
					),
				)
			: eq(plans.ativo, true);

		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(plans)
				.where(where)
				.orderBy(desc(plans.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(plans).where(where),
		]);

		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async create(data: CreatePlanInput) {
		const [row] = await db
			.insert(plans)
			.values({
				name: data.name,
				description: data.description ?? null,
				durationDays: data.durationDays,
			})
			.returning();
		return row;
	}

	async update(id: string, data: UpdatePlanInput) {
		const [row] = await db
			.update(plans)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(and(eq(plans.id, id), eq(plans.ativo, true)))
			.returning();
		return row ?? null;
	}

	async softDelete(id: string) {
		const [row] = await db
			.update(plans)
			.set({
				ativo: false,
				updatedAt: new Date(),
			})
			.where(and(eq(plans.id, id), eq(plans.ativo, true)))
			.returning();
		return row ?? null;
	}

	async countActiveCompaniesByPlanId(planId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(companies)
			.where(and(eq(companies.planId, planId), eq(companies.ativo, true)));
		return row?.value ?? 0;
	}
}
