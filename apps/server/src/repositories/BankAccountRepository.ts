import type {
	CreateBankAccountInput,
	UpdateBankAccountInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { bankAccounts } from "@sync_v2/db/schema/financeiro";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export class BankAccountRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(bankAccounts)
			.where(
				and(
					eq(bankAccounts.id, id),
					eq(bankAccounts.companyId, companyId),
					eq(bankAccounts.ativo, true),
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
					eq(bankAccounts.companyId, params.companyId),
					eq(bankAccounts.ativo, true),
					or(
						ilike(bankAccounts.banco, `%${search}%`),
						ilike(bankAccounts.agencia, `%${search}%`),
						ilike(bankAccounts.conta, `%${search}%`),
					),
				)
			: and(
					eq(bankAccounts.companyId, params.companyId),
					eq(bankAccounts.ativo, true),
				);
		const [items, totalRow] = await Promise.all([
			db
				.select()
				.from(bankAccounts)
				.where(where)
				.orderBy(desc(bankAccounts.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(bankAccounts).where(where),
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
			.from(bankAccounts)
			.where(
				and(
					eq(bankAccounts.companyId, companyId),
					eq(bankAccounts.ativo, true),
				),
			)
			.orderBy(bankAccounts.banco);
	}

	async sumSaldoAtual(companyId: string) {
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${bankAccounts.saldoAtual}), 0)`,
			})
			.from(bankAccounts)
			.where(
				and(
					eq(bankAccounts.companyId, companyId),
					eq(bankAccounts.ativo, true),
				),
			);
		return Number(row?.total ?? 0);
	}

	async create(
		data: CreateBankAccountInput & {
			companyId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(bankAccounts)
			.values({
				companyId: data.companyId,
				banco: data.banco,
				agencia: data.agencia,
				conta: data.conta,
				tipo: data.tipo,
				saldoInicial: data.saldoInicial,
				saldoAtual: data.saldoInicial,
				dataSaldoInicial: data.dataSaldoInicial,
				cor: data.cor,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateBankAccountInput & {
			saldoAtual?: number;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.update(bankAccounts)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(bankAccounts.id, id),
					eq(bankAccounts.companyId, companyId),
					eq(bankAccounts.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async adjustSaldo(
		id: string,
		companyId: string,
		delta: number,
		updatedBy?: string | null,
	) {
		const account = await this.findById(id, companyId);
		if (!account) return null;
		return this.update(id, companyId, {
			saldoAtual: account.saldoAtual + delta,
			updatedBy,
		});
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(bankAccounts)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(bankAccounts.id, id),
					eq(bankAccounts.companyId, companyId),
					eq(bankAccounts.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
