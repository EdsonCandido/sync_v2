import type {
	CreateCompanyInput,
	UpdateCompanyInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { companies } from "@sync_v2/db/schema/companies";
import { plans } from "@sync_v2/db/schema/plans";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export class CompanyRepository {
	async findById(id: string) {
		const [row] = await db
			.select()
			.from(companies)
			.where(and(eq(companies.id, id), eq(companies.ativo, true)))
			.limit(1);
		return row ?? null;
	}

	async findByIdAny(id: string) {
		const [row] = await db
			.select()
			.from(companies)
			.where(eq(companies.id, id))
			.limit(1);
		return row ?? null;
	}

	async findWithPlan(id: string) {
		const [row] = await db
			.select({
				company: companies,
				planName: plans.name,
			})
			.from(companies)
			.innerJoin(plans, eq(companies.planId, plans.id))
			.where(and(eq(companies.id, id), eq(companies.ativo, true)))
			.limit(1);
		return row ?? null;
	}

	async findByDocument(document: string, excludeId?: string) {
		const conditions = [
			eq(companies.document, document),
			eq(companies.ativo, true),
		];
		if (excludeId) {
			conditions.push(sql`${companies.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(companies)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async findByEmail(email: string, excludeId?: string) {
		const conditions = [eq(companies.email, email), eq(companies.ativo, true)];
		if (excludeId) {
			conditions.push(sql`${companies.id} <> ${excludeId}`);
		}
		const [row] = await db
			.select()
			.from(companies)
			.where(and(...conditions))
			.limit(1);
		return row ?? null;
	}

	async list(params: { q?: string; page: number; pageSize: number }) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();

		const where = search
			? and(
					eq(companies.ativo, true),
					or(
						ilike(companies.corporateName, `%${search}%`),
						ilike(companies.tradeName, `%${search}%`),
						ilike(companies.document, `%${search}%`),
						ilike(companies.email, `%${search}%`),
					),
				)
			: eq(companies.ativo, true);

		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(companies)
				.where(where)
				.orderBy(desc(companies.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(companies).where(where),
		]);

		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async listAllActive() {
		return db
			.select()
			.from(companies)
			.where(eq(companies.ativo, true))
			.orderBy(desc(companies.createdAt));
	}

	async create(
		data: CreateCompanyInput & {
			planExpiresAt: Date;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(companies)
			.values({
				corporateName: data.corporateName,
				tradeName: data.tradeName,
				document: data.document,
				email: data.email,
				phone: data.phone,
				website: data.website ?? null,
				logo: data.logo ?? null,
				zipCode: data.zipCode,
				street: data.street,
				number: data.number,
				complement: data.complement ?? null,
				district: data.district,
				city: data.city,
				state: data.state,
				latitude: data.latitude ?? null,
				longitude: data.longitude ?? null,
				planId: data.planId,
				planExpiresAt: data.planExpiresAt,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		data: UpdateCompanyInput & {
			planExpiresAt?: Date;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.update(companies)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(and(eq(companies.id, id), eq(companies.ativo, true)))
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, updatedBy?: string | null) {
		const [row] = await db
			.update(companies)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(and(eq(companies.id, id), eq(companies.ativo, true)))
			.returning();
		return row ?? null;
	}
}
