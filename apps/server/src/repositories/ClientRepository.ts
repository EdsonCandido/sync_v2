import type { CreateClientInput, UpdateClientInput } from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { clients } from "@sync_v2/db/schema/clients";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export class ClientRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(clients)
			.where(
				and(
					eq(clients.id, id),
					eq(clients.companyId, companyId),
					eq(clients.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findByDocument(
		companyId: string,
		document: string,
		excludeId?: string,
	) {
		const conditions = [
			eq(clients.companyId, companyId),
			eq(clients.document, document),
			eq(clients.ativo, true),
		];
		if (excludeId) {
			conditions.push(sql`${clients.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(clients)
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
					eq(clients.companyId, params.companyId),
					eq(clients.ativo, true),
					or(
						ilike(clients.name, `%${search}%`),
						ilike(clients.tradeName, `%${search}%`),
						ilike(clients.document, `%${search}%`),
						ilike(clients.email, `%${search}%`),
					),
				)
			: and(eq(clients.companyId, params.companyId), eq(clients.ativo, true));

		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(clients)
				.where(where)
				.orderBy(desc(clients.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(clients).where(where),
		]);

		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async create(
		data: CreateClientInput & {
			companyId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(clients)
			.values({
				companyId: data.companyId,
				personType: data.personType,
				document: data.document,
				name: data.name,
				tradeName: data.tradeName ?? null,
				email: data.email,
				phone: data.phone,
				zipCode: data.zipCode,
				street: data.street,
				number: data.number,
				complement: data.complement ?? null,
				district: data.district,
				city: data.city,
				state: data.state,
				latitude: data.latitude ?? null,
				longitude: data.longitude ?? null,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateClientInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(clients)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(clients.id, id),
					eq(clients.companyId, companyId),
					eq(clients.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(clients)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(clients.id, id),
					eq(clients.companyId, companyId),
					eq(clients.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
