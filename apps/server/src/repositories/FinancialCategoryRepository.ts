import type {
	CreateFinancialCategoryInput,
	UpdateFinancialCategoryInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { financialCategories } from "@sync_v2/db/schema/financeiro";
import { and, count, desc, eq, ilike, sql } from "drizzle-orm";

export class FinancialCategoryRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(financialCategories)
			.where(
				and(
					eq(financialCategories.id, id),
					eq(financialCategories.companyId, companyId),
					eq(financialCategories.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findByName(companyId: string, name: string, excludeId?: string) {
		const conditions = [
			eq(financialCategories.companyId, companyId),
			eq(financialCategories.name, name),
			eq(financialCategories.ativo, true),
		];
		if (excludeId) {
			conditions.push(sql`${financialCategories.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(financialCategories)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async list(params: {
		companyId: string;
		q?: string;
		tipo?: string;
		page: number;
		pageSize: number;
	}) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();
		const conditions = [
			eq(financialCategories.companyId, params.companyId),
			eq(financialCategories.ativo, true),
		];
		if (params.tipo) {
			conditions.push(eq(financialCategories.tipo, params.tipo));
		}
		if (search) {
			conditions.push(ilike(financialCategories.name, `%${search}%`));
		}
		const where = and(...conditions);
		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(financialCategories)
				.where(where)
				.orderBy(desc(financialCategories.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(financialCategories).where(where),
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
			.from(financialCategories)
			.where(
				and(
					eq(financialCategories.companyId, companyId),
					eq(financialCategories.ativo, true),
				),
			)
			.orderBy(financialCategories.name);
	}

	async create(
		data: CreateFinancialCategoryInput & {
			companyId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(financialCategories)
			.values({
				companyId: data.companyId,
				name: data.name,
				tipo: data.tipo,
				cor: data.cor,
				icone: data.icone,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateFinancialCategoryInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(financialCategories)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(financialCategories.id, id),
					eq(financialCategories.companyId, companyId),
					eq(financialCategories.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(financialCategories)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(financialCategories.id, id),
					eq(financialCategories.companyId, companyId),
					eq(financialCategories.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
