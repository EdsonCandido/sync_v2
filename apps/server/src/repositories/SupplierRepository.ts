import type {
	CreateSupplierInput,
	UpdateSupplierInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { suppliers } from "@sync_v2/db/schema/financeiro";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

export class SupplierRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(suppliers)
			.where(
				and(
					eq(suppliers.id, id),
					eq(suppliers.companyId, companyId),
					eq(suppliers.ativo, true),
				),
			)
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
					eq(suppliers.companyId, params.companyId),
					eq(suppliers.ativo, true),
					or(
						ilike(suppliers.name, `%${search}%`),
						ilike(suppliers.document, `%${search}%`),
						ilike(suppliers.email, `%${search}%`),
					),
				)
			: and(
					eq(suppliers.companyId, params.companyId),
					eq(suppliers.ativo, true),
				);
		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(suppliers)
				.where(where)
				.orderBy(desc(suppliers.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(suppliers).where(where),
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
			.from(suppliers)
			.where(and(eq(suppliers.companyId, companyId), eq(suppliers.ativo, true)))
			.orderBy(suppliers.name);
	}

	async create(
		data: CreateSupplierInput & {
			companyId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(suppliers)
			.values({
				companyId: data.companyId,
				name: data.name,
				document: data.document || null,
				email: data.email || null,
				phone: data.phone || null,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateSupplierInput & { updatedBy?: string | null },
	) {
		const payload: Record<string, unknown> = {
			updatedAt: new Date(),
			updatedBy: data.updatedBy ?? null,
		};
		if (data.name !== undefined) payload.name = data.name;
		if (data.document !== undefined) payload.document = data.document || null;
		if (data.email !== undefined) payload.email = data.email || null;
		if (data.phone !== undefined) payload.phone = data.phone || null;

		const [row] = await db
			.update(suppliers)
			.set(payload)
			.where(
				and(
					eq(suppliers.id, id),
					eq(suppliers.companyId, companyId),
					eq(suppliers.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(suppliers)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(suppliers.id, id),
					eq(suppliers.companyId, companyId),
					eq(suppliers.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
