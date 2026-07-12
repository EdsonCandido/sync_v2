import type {
	CreateCostCenterInput,
	UpdateCostCenterInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { costCenters } from "@sync_v2/db/schema/financeiro";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export class CostCenterRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(costCenters)
			.where(
				and(
					eq(costCenters.id, id),
					eq(costCenters.companyId, companyId),
					eq(costCenters.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findByCodigo(companyId: string, codigo: string, excludeId?: string) {
		const conditions = [
			eq(costCenters.companyId, companyId),
			eq(costCenters.codigo, codigo),
			eq(costCenters.ativo, true),
		];
		if (excludeId) {
			conditions.push(sql`${costCenters.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(costCenters)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async list(params: {
		companyId: string;
		q?: string;
		page: number;
		pageSize: number;
	}) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();
		const where = search
			? and(
					eq(costCenters.companyId, params.companyId),
					eq(costCenters.ativo, true),
					or(
						ilike(costCenters.name, `%${search}%`),
						ilike(costCenters.codigo, `%${search}%`),
					),
				)
			: and(
					eq(costCenters.companyId, params.companyId),
					eq(costCenters.ativo, true),
				);
		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(costCenters)
				.where(where)
				.orderBy(desc(costCenters.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(costCenters).where(where),
		]);
		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async listAllActive(companyId: string) {
		return db
			.select()
			.from(costCenters)
			.where(
				and(eq(costCenters.companyId, companyId), eq(costCenters.ativo, true)),
			)
			.orderBy(costCenters.name);
	}

	async create(
		data: CreateCostCenterInput & {
			companyId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(costCenters)
			.values({
				companyId: data.companyId,
				name: data.name,
				codigo: data.codigo,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateCostCenterInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(costCenters)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(costCenters.id, id),
					eq(costCenters.companyId, companyId),
					eq(costCenters.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(costCenters)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(costCenters.id, id),
					eq(costCenters.companyId, companyId),
					eq(costCenters.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
