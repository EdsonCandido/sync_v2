import { db } from "@sync_v2/db";
import { clients } from "@sync_v2/db/schema/clients";
import {
	bankAccounts,
	costCenters,
	financialCategories,
	financialEntries,
	financialEntryAttachments,
	financialEntryHistory,
	financialEntryPayments,
	suppliers,
} from "@sync_v2/db/schema/financeiro";
import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	ilike,
	lte,
	ne,
	or,
	sql,
} from "drizzle-orm";

export type FinancialEntryInsert = {
	companyId: string;
	kind: string;
	originType: string;
	originLabel?: string | null;
	kanbanCardId?: string | null;
	clientId?: string | null;
	supplierId?: string | null;
	categoryId?: string | null;
	costCenterId?: string | null;
	bankAccountId?: string | null;
	documento?: string | null;
	numero?: string | null;
	valorOriginal: number;
	desconto?: number;
	acrescimo?: number;
	juros?: number;
	multa?: number;
	valorPago?: number;
	valorAberto: number;
	dataEmissao: Date;
	dataVencimento: Date;
	dataLiquidacao?: Date | null;
	status?: string;
	observacoes?: string | null;
	installmentGroupId?: string | null;
	installmentNumber?: number | null;
	installmentTotal?: number | null;
	createdBy?: string | null;
	updatedBy?: string | null;
};

function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

function endOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(23, 59, 59, 999);
	return x;
}

export class FinancialEntryRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select({
				entry: financialEntries,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
				costCenterName: costCenters.name,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.id, id),
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
				),
			)
			.limit(1);
		if (!row) return null;
		return {
			...row.entry,
			clientName: row.clientName,
			supplierName: row.supplierName,
			categoryName: row.categoryName,
			costCenterName: row.costCenterName,
		};
	}

	async listActiveByKanbanCardId(cardId: string, companyId: string) {
		const rows = await db
			.select({ entry: financialEntries })
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.kanbanCardId, cardId),
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					ne(financialEntries.status, "cancelado"),
				),
			)
			.orderBy(desc(financialEntries.createdAt));
		const today = startOfDay(new Date());
		return rows.map((row) => ({
			id: row.entry.id,
			kind: row.entry.kind,
			status: deriveStatus(row.entry.status, row.entry.dataVencimento, today),
			valorOriginal: row.entry.valorOriginal,
		}));
	}

	async list(params: {
		companyId: string;
		q?: string;
		kind?: string;
		status?: string;
		categoryId?: string;
		costCenterId?: string;
		bankAccountId?: string;
		clientId?: string;
		supplierId?: string;
		from?: Date;
		to?: Date;
		page: number;
		pageSize: number;
	}) {
		const offset = (params.page - 1) * params.pageSize;
		const conditions = [
			eq(financialEntries.companyId, params.companyId),
			eq(financialEntries.ativo, true),
		];
		if (params.kind) conditions.push(eq(financialEntries.kind, params.kind));
		if (params.categoryId) {
			conditions.push(eq(financialEntries.categoryId, params.categoryId));
		}
		if (params.costCenterId) {
			conditions.push(eq(financialEntries.costCenterId, params.costCenterId));
		}
		if (params.bankAccountId) {
			conditions.push(eq(financialEntries.bankAccountId, params.bankAccountId));
		}
		if (params.clientId) {
			conditions.push(eq(financialEntries.clientId, params.clientId));
		}
		if (params.supplierId) {
			conditions.push(eq(financialEntries.supplierId, params.supplierId));
		}
		if (params.from) {
			conditions.push(
				gte(financialEntries.dataVencimento, startOfDay(params.from)),
			);
		}
		if (params.to) {
			conditions.push(
				lte(financialEntries.dataVencimento, endOfDay(params.to)),
			);
		}
		if (params.q?.trim()) {
			const search = params.q.trim();
			conditions.push(
				or(
					ilike(financialEntries.documento, `%${search}%`),
					ilike(financialEntries.numero, `%${search}%`),
					ilike(financialEntries.originLabel, `%${search}%`),
					ilike(financialEntries.observacoes, `%${search}%`),
				)!,
			);
		}

		const where = and(...conditions);
		const [rawItems, totalRow] = await Promise.all([
			db
				.select({
					entry: financialEntries,
					clientName: clients.name,
					supplierName: suppliers.name,
					categoryName: financialCategories.name,
					costCenterName: costCenters.name,
				})
				.from(financialEntries)
				.leftJoin(clients, eq(financialEntries.clientId, clients.id))
				.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
				.leftJoin(
					financialCategories,
					eq(financialEntries.categoryId, financialCategories.id),
				)
				.leftJoin(
					costCenters,
					eq(financialEntries.costCenterId, costCenters.id),
				)
				.where(where)
				.orderBy(desc(financialEntries.dataVencimento))
				.limit(params.pageSize)
				.offset(offset),
			db.select({ value: count() }).from(financialEntries).where(where),
		]);

		const today = startOfDay(new Date());
		let items = rawItems.map((row) => {
			const status = deriveStatus(
				row.entry.status,
				row.entry.dataVencimento,
				today,
			);
			return {
				...row.entry,
				status,
				clientName: row.clientName,
				supplierName: row.supplierName,
				categoryName: row.categoryName,
				costCenterName: row.costCenterName,
			};
		});

		if (params.status) {
			items = items.filter((item) => item.status === params.status);
		}

		return {
			items,
			total: params.status ? items.length : (totalRow[0]?.value ?? 0),
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async create(data: FinancialEntryInsert) {
		const [row] = await db
			.insert(financialEntries)
			.values({
				companyId: data.companyId,
				kind: data.kind,
				originType: data.originType,
				originLabel: data.originLabel ?? null,
				kanbanCardId: data.kanbanCardId ?? null,
				clientId: data.clientId ?? null,
				supplierId: data.supplierId ?? null,
				categoryId: data.categoryId ?? null,
				costCenterId: data.costCenterId ?? null,
				bankAccountId: data.bankAccountId ?? null,
				documento: data.documento ?? null,
				numero: data.numero ?? null,
				valorOriginal: data.valorOriginal,
				desconto: data.desconto ?? 0,
				acrescimo: data.acrescimo ?? 0,
				juros: data.juros ?? 0,
				multa: data.multa ?? 0,
				valorPago: data.valorPago ?? 0,
				valorAberto: data.valorAberto,
				dataEmissao: data.dataEmissao,
				dataVencimento: data.dataVencimento,
				dataLiquidacao: data.dataLiquidacao ?? null,
				status: data.status ?? "em_aberto",
				observacoes: data.observacoes ?? null,
				installmentGroupId: data.installmentGroupId ?? null,
				installmentNumber: data.installmentNumber ?? null,
				installmentTotal: data.installmentTotal ?? null,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async createMany(rows: FinancialEntryInsert[]) {
		if (rows.length === 0) return [];
		return db
			.insert(financialEntries)
			.values(
				rows.map((data) => ({
					companyId: data.companyId,
					kind: data.kind,
					originType: data.originType,
					originLabel: data.originLabel ?? null,
					kanbanCardId: data.kanbanCardId ?? null,
					clientId: data.clientId ?? null,
					supplierId: data.supplierId ?? null,
					categoryId: data.categoryId ?? null,
					costCenterId: data.costCenterId ?? null,
					bankAccountId: data.bankAccountId ?? null,
					documento: data.documento ?? null,
					numero: data.numero ?? null,
					valorOriginal: data.valorOriginal,
					desconto: data.desconto ?? 0,
					acrescimo: data.acrescimo ?? 0,
					juros: data.juros ?? 0,
					multa: data.multa ?? 0,
					valorPago: data.valorPago ?? 0,
					valorAberto: data.valorAberto,
					dataEmissao: data.dataEmissao,
					dataVencimento: data.dataVencimento,
					dataLiquidacao: data.dataLiquidacao ?? null,
					status: data.status ?? "em_aberto",
					observacoes: data.observacoes ?? null,
					installmentGroupId: data.installmentGroupId ?? null,
					installmentNumber: data.installmentNumber ?? null,
					installmentTotal: data.installmentTotal ?? null,
					createdBy: data.createdBy ?? null,
					updatedBy: data.updatedBy ?? null,
				})),
			)
			.returning();
	}

	async update(
		id: string,
		companyId: string,
		data: Partial<{
			originLabel: string | null;
			clientId: string | null;
			supplierId: string | null;
			categoryId: string | null;
			costCenterId: string | null;
			bankAccountId: string | null;
			documento: string | null;
			numero: string | null;
			desconto: number;
			acrescimo: number;
			juros: number;
			multa: number;
			valorPago: number;
			valorAberto: number;
			valorOriginal: number;
			dataEmissao: Date;
			dataVencimento: Date;
			dataLiquidacao: Date | null;
			status: string;
			observacoes: string | null;
			updatedBy: string | null;
		}>,
	) {
		const [row] = await db
			.update(financialEntries)
			.set({ ...data, updatedAt: new Date() })
			.where(
				and(
					eq(financialEntries.id, id),
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(financialEntries)
			.set({
				ativo: false,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(financialEntries.id, id),
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async cancel(id: string, companyId: string, updatedBy?: string | null) {
		return this.update(id, companyId, {
			status: "cancelado",
			valorAberto: 0,
			updatedBy: updatedBy ?? null,
		});
	}

	async listByGroup(companyId: string, groupId: string) {
		const rows = await db
			.select({
				entry: financialEntries,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
				costCenterName: costCenters.name,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.installmentGroupId, groupId),
					eq(financialEntries.ativo, true),
				),
			)
			.orderBy(asc(financialEntries.installmentNumber));
		const today = startOfDay(new Date());
		return rows.map((row) => ({
			...row.entry,
			status: deriveStatus(row.entry.status, row.entry.dataVencimento, today),
			clientName: row.clientName,
			supplierName: row.supplierName,
			categoryName: row.categoryName,
			costCenterName: row.costCenterName,
		}));
	}

	async listOpenByGroup(companyId: string, groupId: string) {
		return db
			.select()
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.installmentGroupId, groupId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
				),
			);
	}

	async listPayments(entryId: string, companyId: string) {
		return db
			.select()
			.from(financialEntryPayments)
			.where(
				and(
					eq(financialEntryPayments.entryId, entryId),
					eq(financialEntryPayments.companyId, companyId),
					eq(financialEntryPayments.ativo, true),
				),
			)
			.orderBy(desc(financialEntryPayments.dataPagamento));
	}

	async findPayment(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(financialEntryPayments)
			.where(
				and(
					eq(financialEntryPayments.id, id),
					eq(financialEntryPayments.companyId, companyId),
					eq(financialEntryPayments.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async createPayment(data: {
		companyId: string;
		entryId: string;
		bankAccountId: string;
		valor: number;
		juros: number;
		multa: number;
		desconto: number;
		dataPagamento: Date;
		observacoes?: string | null;
		createdBy?: string | null;
		updatedBy?: string | null;
	}) {
		const [row] = await db
			.insert(financialEntryPayments)
			.values({
				companyId: data.companyId,
				entryId: data.entryId,
				bankAccountId: data.bankAccountId,
				valor: data.valor,
				juros: data.juros,
				multa: data.multa,
				desconto: data.desconto,
				dataPagamento: data.dataPagamento,
				observacoes: data.observacoes ?? null,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async reversePayment(
		id: string,
		companyId: string,
		updatedBy?: string | null,
	) {
		const [row] = await db
			.update(financialEntryPayments)
			.set({
				estornado: true,
				estornadoEm: new Date(),
				estornadoPor: updatedBy ?? null,
				updatedAt: new Date(),
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(financialEntryPayments.id, id),
					eq(financialEntryPayments.companyId, companyId),
					eq(financialEntryPayments.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async addHistory(data: {
		companyId: string;
		entryId: string;
		action: string;
		userId?: string | null;
		ip?: string | null;
		payload?: unknown;
	}) {
		const [row] = await db
			.insert(financialEntryHistory)
			.values({
				companyId: data.companyId,
				entryId: data.entryId,
				action: data.action,
				userId: data.userId ?? null,
				ip: data.ip ?? null,
				payload: data.payload ?? null,
			})
			.returning();
		return row;
	}

	async listHistory(entryId: string, companyId: string) {
		return db
			.select()
			.from(financialEntryHistory)
			.where(
				and(
					eq(financialEntryHistory.entryId, entryId),
					eq(financialEntryHistory.companyId, companyId),
					eq(financialEntryHistory.ativo, true),
				),
			)
			.orderBy(desc(financialEntryHistory.createdAt));
	}

	async listAttachmentsMeta(entryId: string) {
		return db
			.select({
				id: financialEntryAttachments.id,
				originalName: financialEntryAttachments.originalName,
				mimeType: financialEntryAttachments.mimeType,
				sizeBytes: financialEntryAttachments.sizeBytes,
				uploadedBy: financialEntryAttachments.uploadedBy,
				createdAt: financialEntryAttachments.createdAt,
			})
			.from(financialEntryAttachments)
			.where(
				and(
					eq(financialEntryAttachments.entryId, entryId),
					eq(financialEntryAttachments.ativo, true),
				),
			)
			.orderBy(desc(financialEntryAttachments.createdAt));
	}

	async createAttachment(data: {
		entryId: string;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
		content: Buffer;
		uploadedBy?: string | null;
	}) {
		const [row] = await db
			.insert(financialEntryAttachments)
			.values({
				entryId: data.entryId,
				originalName: data.originalName,
				mimeType: data.mimeType,
				sizeBytes: data.sizeBytes,
				content: data.content,
				uploadedBy: data.uploadedBy ?? null,
			})
			.returning({
				id: financialEntryAttachments.id,
				originalName: financialEntryAttachments.originalName,
				mimeType: financialEntryAttachments.mimeType,
				sizeBytes: financialEntryAttachments.sizeBytes,
				uploadedBy: financialEntryAttachments.uploadedBy,
				createdAt: financialEntryAttachments.createdAt,
			});
		return row;
	}

	async findAttachment(id: string, entryId: string) {
		const [row] = await db
			.select()
			.from(financialEntryAttachments)
			.where(
				and(
					eq(financialEntryAttachments.id, id),
					eq(financialEntryAttachments.entryId, entryId),
					eq(financialEntryAttachments.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async softDeleteAttachment(id: string, entryId: string) {
		const [row] = await db
			.update(financialEntryAttachments)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(financialEntryAttachments.id, id),
					eq(financialEntryAttachments.entryId, entryId),
					eq(financialEntryAttachments.ativo, true),
				),
			)
			.returning({
				id: financialEntryAttachments.id,
				originalName: financialEntryAttachments.originalName,
			});
		return row ?? null;
	}

	async sumOpenDueOn(
		companyId: string,
		kind: string,
		day: Date,
	): Promise<number> {
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, startOfDay(day)),
					lte(financialEntries.dataVencimento, endOfDay(day)),
				),
			);
		return Number(row?.total ?? 0);
	}

	async sumOpenOverdue(companyId: string, kind: string): Promise<number> {
		const today = startOfDay(new Date());
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					lte(financialEntries.dataVencimento, today),
					sql`${financialEntries.dataVencimento} < ${today}`,
				),
			);
		return Number(row?.total ?? 0);
	}

	async sumOpenOnTime(companyId: string, kind: string): Promise<number> {
		const today = startOfDay(new Date());
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, today),
				),
			);
		return Number(row?.total ?? 0);
	}

	async sumValorAberto(companyId: string): Promise<number> {
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
				),
			);
		return Number(row?.total ?? 0);
	}

	async countDistinctOverdueClients(companyId: string): Promise<number> {
		const today = startOfDay(new Date());
		const [row] = await db
			.select({
				total: sql<number>`count(distinct ${financialEntries.clientId})`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, "receber"),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					sql`${financialEntries.clientId} is not null`,
					sql`${financialEntries.dataVencimento} < ${today}`,
				),
			);
		return Number(row?.total ?? 0);
	}

	async sumPaymentsInRange(
		companyId: string,
		kind: string,
		from: Date,
		to: Date,
	) {
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntryPayments.valor}), 0)`,
				count: sql<number>`count(*)`,
				descontos: sql<number>`coalesce(sum(${financialEntryPayments.desconto}), 0)`,
				acrescimos: sql<number>`coalesce(sum(${financialEntryPayments.juros} + ${financialEntryPayments.multa}), 0)`,
			})
			.from(financialEntryPayments)
			.innerJoin(
				financialEntries,
				eq(financialEntryPayments.entryId, financialEntries.id),
			)
			.where(
				and(
					eq(financialEntryPayments.companyId, companyId),
					eq(financialEntryPayments.ativo, true),
					eq(financialEntryPayments.estornado, false),
					eq(financialEntries.kind, kind),
					eq(financialEntries.ativo, true),
					gte(financialEntryPayments.dataPagamento, startOfDay(from)),
					lte(financialEntryPayments.dataPagamento, endOfDay(to)),
				),
			);
		return {
			total: Number(row?.total ?? 0),
			count: Number(row?.count ?? 0),
			descontos: Number(row?.descontos ?? 0),
			acrescimos: Number(row?.acrescimos ?? 0),
		};
	}

	async yearlyPaymentSeries(companyId: string, year: number) {
		const result: Array<{
			month: string;
			receitas: number;
			despesas: number;
		}> = [];
		for (let m = 0; m < 12; m++) {
			const from = new Date(year, m, 1);
			const to = new Date(year, m + 1, 0);
			const month = `${year}-${String(m + 1).padStart(2, "0")}`;
			const [receber, pagar] = await Promise.all([
				this.sumPaymentsInRange(companyId, "receber", from, to),
				this.sumPaymentsInRange(companyId, "pagar", from, to),
			]);
			result.push({
				month,
				receitas: receber.total,
				despesas: pagar.total,
			});
		}
		return result;
	}

	async yearlyProjectionByDueDate(companyId: string, year: number) {
		const from = new Date(year, 0, 1);
		const to = new Date(year, 11, 31, 23, 59, 59, 999);

		const rows = await db
			.select({
				month: sql<string>`to_char(date_trunc('month', ${financialEntries.dataVencimento}), 'YYYY-MM')`,
				kind: financialEntries.kind,
				valor: sql<number>`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} <> 'cancelado'`,
					gte(financialEntries.dataVencimento, from),
					lte(financialEntries.dataVencimento, to),
				),
			)
			.groupBy(
				sql`date_trunc('month', ${financialEntries.dataVencimento})`,
				financialEntries.kind,
			);

		const byMonth = new Map<string, { receitas: number; despesas: number }>();
		for (let m = 1; m <= 12; m++) {
			const key = `${year}-${String(m).padStart(2, "0")}`;
			byMonth.set(key, { receitas: 0, despesas: 0 });
		}

		for (const row of rows) {
			const bucket = byMonth.get(row.month);
			if (!bucket) continue;
			const valor = Number(row.valor);
			if (row.kind === "receber") bucket.receitas = valor;
			else if (row.kind === "pagar") bucket.despesas = valor;
		}

		return Array.from(byMonth.entries()).map(([month, values]) => ({
			month,
			receitas: values.receitas,
			despesas: values.despesas,
		}));
	}

	async groupOpenByCategory(companyId: string) {
		const rows = await db
			.select({
				name: sql<string>`coalesce(${financialCategories.name}, 'Sem categoria')`,
				cor: sql<string>`coalesce(${financialCategories.cor}, 'gray')`,
				valor: sql<number>`coalesce(sum(${financialEntries.valorAberto} + ${financialEntries.valorPago}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} <> 'cancelado'`,
				),
			)
			.groupBy(financialCategories.name, financialCategories.cor);
		return rows.map((r) => ({
			name: r.name,
			cor: r.cor,
			valor: Number(r.valor),
		}));
	}

	async groupOpenByCostCenter(companyId: string) {
		const rows = await db
			.select({
				name: sql<string>`coalesce(${costCenters.name}, 'Sem centro')`,
				valor: sql<number>`coalesce(sum(${financialEntries.valorAberto} + ${financialEntries.valorPago}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} <> 'cancelado'`,
				),
			)
			.groupBy(costCenters.name);
		return rows.map((r) => ({
			name: r.name,
			valor: Number(r.valor),
		}));
	}

	async listOpenEntriesForReport(companyId: string, kind: string) {
		const rows = await db
			.select({
				entry: financialEntries,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
				costCenterName: costCenters.name,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
				),
			)
			.orderBy(financialEntries.dataVencimento);

		const today = startOfDay(new Date());
		return rows.map((row) => ({
			...row.entry,
			status: deriveStatus(row.entry.status, row.entry.dataVencimento, today),
			clientName: row.clientName,
			supplierName: row.supplierName,
			categoryName: row.categoryName,
			costCenterName: row.costCenterName,
		}));
	}

	async groupOpenByCostCenterAndKind(companyId: string) {
		const rows = await db
			.select({
				kind: financialEntries.kind,
				name: sql<string>`coalesce(${costCenters.name}, 'Sem centro')`,
				quantidade: sql<number>`count(*)::int`,
				valorTotal: sql<number>`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0)`,
				valorAberto: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
				),
			)
			.groupBy(financialEntries.kind, costCenters.name)
			.orderBy(financialEntries.kind, costCenters.name);

		return rows.map((r) => ({
			kind: r.kind as "receber" | "pagar",
			name: r.name,
			quantidade: Number(r.quantidade),
			valorTotal: Number(r.valorTotal),
			valorAberto: Number(r.valorAberto),
		}));
	}

	async groupByPlanoContas(companyId: string) {
		const rows = await db
			.select({
				name: sql<string>`coalesce(${financialCategories.name}, 'Sem categoria')`,
				tipo: sql<string>`coalesce(${financialCategories.tipo}, 'despesa')`,
				valor: sql<number>`coalesce(sum(${financialEntries.valorAberto} + ${financialEntries.valorPago}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} <> 'cancelado'`,
				),
			)
			.groupBy(financialCategories.name, financialCategories.tipo);
		return rows.map((r) => ({
			name: r.name,
			tipo: (r.tipo === "receita" ? "receita" : "despesa") as
				| "receita"
				| "despesa",
			valor: Number(r.valor),
		}));
	}

	async sumPaymentsGroupedByDay(
		companyId: string,
		kind: string,
		from: Date,
		to: Date,
	) {
		const rows = await db
			.select({
				day: sql<string>`to_char(date_trunc('day', ${financialEntryPayments.dataPagamento}), 'YYYY-MM-DD')`,
				total: sql<number>`coalesce(sum(${financialEntryPayments.valor}), 0)`,
			})
			.from(financialEntryPayments)
			.innerJoin(
				financialEntries,
				eq(financialEntryPayments.entryId, financialEntries.id),
			)
			.where(
				and(
					eq(financialEntryPayments.companyId, companyId),
					eq(financialEntryPayments.ativo, true),
					eq(financialEntryPayments.estornado, false),
					eq(financialEntries.kind, kind),
					eq(financialEntries.ativo, true),
					gte(financialEntryPayments.dataPagamento, startOfDay(from)),
					lte(financialEntryPayments.dataPagamento, endOfDay(to)),
				),
			)
			.groupBy(sql`date_trunc('day', ${financialEntryPayments.dataPagamento})`)
			.orderBy(sql`date_trunc('day', ${financialEntryPayments.dataPagamento})`);
		return rows.map((r) => ({
			day: r.day,
			total: Number(r.total),
		}));
	}

	async sumOpenDueGroupedByDay(
		companyId: string,
		kind: string,
		from: Date,
		to: Date,
	) {
		const rows = await db
			.select({
				day: sql<string>`to_char(date_trunc('day', ${financialEntries.dataVencimento}), 'YYYY-MM-DD')`,
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, startOfDay(from)),
					lte(financialEntries.dataVencimento, endOfDay(to)),
				),
			)
			.groupBy(sql`date_trunc('day', ${financialEntries.dataVencimento})`)
			.orderBy(sql`date_trunc('day', ${financialEntries.dataVencimento})`);
		return rows.map((r) => ({
			day: r.day,
			total: Number(r.total),
		}));
	}

	async sumOpenDueInRange(
		companyId: string,
		kind: string,
		from: Date,
		to: Date,
	): Promise<number> {
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, startOfDay(from)),
					lte(financialEntries.dataVencimento, endOfDay(to)),
				),
			);
		return Number(row?.total ?? 0);
	}

	async listOpenDueBetween(
		companyId: string,
		from: Date,
		to: Date,
		limit = 50,
	) {
		return db
			.select({
				id: financialEntries.id,
				kind: financialEntries.kind,
				originLabel: financialEntries.originLabel,
				dataVencimento: financialEntries.dataVencimento,
				valorAberto: financialEntries.valorAberto,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, startOfDay(from)),
					lte(financialEntries.dataVencimento, endOfDay(to)),
				),
			)
			.orderBy(financialEntries.dataVencimento)
			.limit(limit);
	}

	async sumOpenOverdueInRange(
		companyId: string,
		kind: string,
		from: Date,
		to: Date,
		asOf: Date,
	): Promise<number> {
		const asOfDay = startOfDay(asOf);
		const [row] = await db
			.select({
				total: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.where(
				and(
					eq(financialEntries.companyId, companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, kind),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					gte(financialEntries.dataVencimento, startOfDay(from)),
					lte(financialEntries.dataVencimento, endOfDay(to)),
					sql`${financialEntries.dataVencimento} < ${asOfDay}`,
				),
			);
		return Number(row?.total ?? 0);
	}

	async listEntriesByDueInPeriod(params: {
		companyId: string;
		kind: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				entry: financialEntries,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
				costCenterName: costCenters.name,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, params.companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, params.kind),
					sql`${financialEntries.status} <> 'cancelado'`,
					gte(financialEntries.dataVencimento, startOfDay(params.from)),
					lte(financialEntries.dataVencimento, endOfDay(params.to)),
				),
			)
			.orderBy(financialEntries.dataVencimento);

		const today = startOfDay(new Date());
		return rows.map((row) => ({
			...row.entry,
			status: deriveStatus(row.entry.status, row.entry.dataVencimento, today),
			clientName: row.clientName,
			supplierName: row.supplierName,
			categoryName: row.categoryName,
			costCenterName: row.costCenterName,
		}));
	}

	async groupByClientInPeriod(params: {
		companyId: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				clientId: financialEntries.clientId,
				clientName: sql<string>`coalesce(${clients.name}, 'Sem cliente')`,
				quantidade: sql<number>`count(*)::int`,
				valorPago: sql<number>`coalesce(sum(${financialEntries.valorPago}), 0)`,
				valorAberto: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
				valorTotal: sql<number>`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.where(
				and(
					eq(financialEntries.companyId, params.companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, "receber"),
					sql`${financialEntries.status} <> 'cancelado'`,
					gte(financialEntries.dataVencimento, startOfDay(params.from)),
					lte(financialEntries.dataVencimento, endOfDay(params.to)),
				),
			)
			.groupBy(financialEntries.clientId, clients.name)
			.orderBy(
				sql`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0) desc`,
			);

		return rows.map((r) => ({
			clientId: r.clientId,
			clientName: r.clientName,
			quantidade: Number(r.quantidade),
			valorPago: Number(r.valorPago),
			valorAberto: Number(r.valorAberto),
			valorTotal: Number(r.valorTotal),
		}));
	}

	async groupExpensesByCategoryInPeriod(params: {
		companyId: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				categoryId: financialEntries.categoryId,
				categoryName: sql<string>`coalesce(${financialCategories.name}, 'Sem categoria')`,
				quantidade: sql<number>`count(*)::int`,
				valorPago: sql<number>`coalesce(sum(${financialEntries.valorPago}), 0)`,
				valorAberto: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
				valorTotal: sql<number>`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.where(
				and(
					eq(financialEntries.companyId, params.companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, "pagar"),
					sql`${financialEntries.status} <> 'cancelado'`,
					gte(financialEntries.dataVencimento, startOfDay(params.from)),
					lte(financialEntries.dataVencimento, endOfDay(params.to)),
				),
			)
			.groupBy(financialEntries.categoryId, financialCategories.name)
			.orderBy(
				sql`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0) desc`,
			);

		return rows.map((r) => ({
			categoryId: r.categoryId,
			categoryName: r.categoryName,
			quantidade: Number(r.quantidade),
			valorPago: Number(r.valorPago),
			valorAberto: Number(r.valorAberto),
			valorTotal: Number(r.valorTotal),
		}));
	}

	async groupByCostCenterAndKindInPeriod(params: {
		companyId: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				kind: financialEntries.kind,
				costCenterId: financialEntries.costCenterId,
				name: sql<string>`coalesce(${costCenters.name}, 'Sem centro')`,
				quantidade: sql<number>`count(*)::int`,
				valorPago: sql<number>`coalesce(sum(${financialEntries.valorPago}), 0)`,
				valorAberto: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
				valorTotal: sql<number>`coalesce(sum(${financialEntries.valorOriginal} - ${financialEntries.desconto} + ${financialEntries.acrescimo} + ${financialEntries.juros} + ${financialEntries.multa}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(
				and(
					eq(financialEntries.companyId, params.companyId),
					eq(financialEntries.ativo, true),
					sql`${financialEntries.status} <> 'cancelado'`,
					gte(financialEntries.dataVencimento, startOfDay(params.from)),
					lte(financialEntries.dataVencimento, endOfDay(params.to)),
				),
			)
			.groupBy(
				financialEntries.kind,
				financialEntries.costCenterId,
				costCenters.name,
			)
			.orderBy(financialEntries.kind, costCenters.name);

		return rows.map((r) => ({
			kind: r.kind as "receber" | "pagar",
			costCenterId: r.costCenterId,
			name: r.name,
			quantidade: Number(r.quantidade),
			valorPago: Number(r.valorPago),
			valorAberto: Number(r.valorAberto),
			valorTotal: Number(r.valorTotal),
		}));
	}

	async listOverdueEntries(params: {
		companyId: string;
		asOf: Date;
		kind?: string;
	}) {
		const asOfDay = startOfDay(params.asOf);
		const conditions = [
			eq(financialEntries.companyId, params.companyId),
			eq(financialEntries.ativo, true),
			sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
			sql`${financialEntries.dataVencimento} < ${asOfDay}`,
		];
		if (params.kind) {
			conditions.push(eq(financialEntries.kind, params.kind));
		}
		const rows = await db
			.select({
				entry: financialEntries,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
				costCenterName: costCenters.name,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.leftJoin(costCenters, eq(financialEntries.costCenterId, costCenters.id))
			.where(and(...conditions))
			.orderBy(financialEntries.dataVencimento);

		return rows.map((row) => ({
			...row.entry,
			status: "vencido" as const,
			clientName: row.clientName,
			supplierName: row.supplierName,
			categoryName: row.categoryName,
			costCenterName: row.costCenterName,
			diasAtraso: Math.max(
				0,
				Math.floor(
					(asOfDay.getTime() - startOfDay(row.entry.dataVencimento).getTime()) /
						(1000 * 60 * 60 * 24),
				),
			),
		}));
	}

	async groupOverdueByClient(params: { companyId: string; asOf: Date }) {
		const asOfDay = startOfDay(params.asOf);
		const rows = await db
			.select({
				clientId: financialEntries.clientId,
				clientName: sql<string>`coalesce(${clients.name}, 'Sem cliente')`,
				quantidade: sql<number>`count(*)::int`,
				valorAberto: sql<number>`coalesce(sum(${financialEntries.valorAberto}), 0)`,
			})
			.from(financialEntries)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.where(
				and(
					eq(financialEntries.companyId, params.companyId),
					eq(financialEntries.ativo, true),
					eq(financialEntries.kind, "receber"),
					sql`${financialEntries.status} IN ('em_aberto', 'parcial')`,
					sql`${financialEntries.dataVencimento} < ${asOfDay}`,
					sql`${financialEntries.clientId} is not null`,
				),
			)
			.groupBy(financialEntries.clientId, clients.name)
			.orderBy(sql`coalesce(sum(${financialEntries.valorAberto}), 0) desc`);

		return rows.map((r) => ({
			clientId: r.clientId as string,
			clientName: r.clientName,
			quantidade: Number(r.quantidade),
			valorAberto: Number(r.valorAberto),
		}));
	}

	async sumPaymentsGroupedByBank(params: {
		companyId: string;
		kind: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				bankAccountId: financialEntryPayments.bankAccountId,
				banco: sql<string>`coalesce(${bankAccounts.banco}, 'Sem banco')`,
				agencia: sql<string>`coalesce(${bankAccounts.agencia}, '')`,
				conta: sql<string>`coalesce(${bankAccounts.conta}, '')`,
				quantidade: sql<number>`count(*)::int`,
				total: sql<number>`coalesce(sum(${financialEntryPayments.valor}), 0)`,
			})
			.from(financialEntryPayments)
			.innerJoin(
				financialEntries,
				eq(financialEntryPayments.entryId, financialEntries.id),
			)
			.leftJoin(
				bankAccounts,
				eq(financialEntryPayments.bankAccountId, bankAccounts.id),
			)
			.where(
				and(
					eq(financialEntryPayments.companyId, params.companyId),
					eq(financialEntryPayments.ativo, true),
					eq(financialEntryPayments.estornado, false),
					eq(financialEntries.kind, params.kind),
					eq(financialEntries.ativo, true),
					gte(financialEntryPayments.dataPagamento, startOfDay(params.from)),
					lte(financialEntryPayments.dataPagamento, endOfDay(params.to)),
				),
			)
			.groupBy(
				financialEntryPayments.bankAccountId,
				bankAccounts.banco,
				bankAccounts.agencia,
				bankAccounts.conta,
			)
			.orderBy(sql`coalesce(sum(${financialEntryPayments.valor}), 0) desc`);

		return rows.map((r) => ({
			bankAccountId: r.bankAccountId,
			banco: r.banco,
			agencia: r.agencia,
			conta: r.conta,
			quantidade: Number(r.quantidade),
			total: Number(r.total),
		}));
	}

	async sumPaymentsBeforeDateForBank(params: {
		companyId: string;
		bankAccountId: string;
		before: Date;
	}) {
		const rows = await db
			.select({
				kind: financialEntries.kind,
				total: sql<number>`coalesce(sum(${financialEntryPayments.valor}), 0)`,
			})
			.from(financialEntryPayments)
			.innerJoin(
				financialEntries,
				eq(financialEntryPayments.entryId, financialEntries.id),
			)
			.where(
				and(
					eq(financialEntryPayments.companyId, params.companyId),
					eq(financialEntryPayments.ativo, true),
					eq(financialEntryPayments.estornado, false),
					eq(financialEntryPayments.bankAccountId, params.bankAccountId),
					eq(financialEntries.ativo, true),
					sql`${financialEntryPayments.dataPagamento} < ${startOfDay(params.before)}`,
				),
			)
			.groupBy(financialEntries.kind);

		let credit = 0;
		let debit = 0;
		for (const row of rows) {
			const total = Number(row.total);
			if (row.kind === "receber") credit += total;
			else if (row.kind === "pagar") debit += total;
		}
		return { credit, debit };
	}

	async listExtratoLines(params: {
		companyId: string;
		bankAccountId: string;
		from: Date;
		to: Date;
	}) {
		const rows = await db
			.select({
				paymentId: financialEntryPayments.id,
				dataPagamento: financialEntryPayments.dataPagamento,
				valor: financialEntryPayments.valor,
				observacoes: financialEntryPayments.observacoes,
				kind: financialEntries.kind,
				documento: financialEntries.documento,
				numero: financialEntries.numero,
				clientName: clients.name,
				supplierName: suppliers.name,
				categoryName: financialCategories.name,
			})
			.from(financialEntryPayments)
			.innerJoin(
				financialEntries,
				eq(financialEntryPayments.entryId, financialEntries.id),
			)
			.leftJoin(clients, eq(financialEntries.clientId, clients.id))
			.leftJoin(suppliers, eq(financialEntries.supplierId, suppliers.id))
			.leftJoin(
				financialCategories,
				eq(financialEntries.categoryId, financialCategories.id),
			)
			.where(
				and(
					eq(financialEntryPayments.companyId, params.companyId),
					eq(financialEntryPayments.ativo, true),
					eq(financialEntryPayments.estornado, false),
					eq(financialEntryPayments.bankAccountId, params.bankAccountId),
					eq(financialEntries.ativo, true),
					gte(financialEntryPayments.dataPagamento, startOfDay(params.from)),
					lte(financialEntryPayments.dataPagamento, endOfDay(params.to)),
				),
			)
			.orderBy(
				financialEntryPayments.dataPagamento,
				financialEntryPayments.createdAt,
			);

		return rows.map((r) => ({
			paymentId: r.paymentId,
			dataPagamento: r.dataPagamento,
			valor: Number(r.valor),
			observacoes: r.observacoes,
			kind: r.kind as "receber" | "pagar",
			documento: r.documento,
			numero: r.numero,
			clientName: r.clientName,
			supplierName: r.supplierName,
			categoryName: r.categoryName,
			credito: r.kind === "receber" ? Number(r.valor) : 0,
			debito: r.kind === "pagar" ? Number(r.valor) : 0,
		}));
	}
}

export function deriveStatus(
	status: string,
	dataVencimento: Date,
	today = startOfDay(new Date()),
) {
	if (status === "pago" || status === "cancelado") return status;
	if (
		(status === "em_aberto" || status === "parcial") &&
		startOfDay(dataVencimento) < today
	) {
		return "vencido";
	}
	return status;
}

export function calcValorAberto(
	valorOriginal: number,
	desconto: number,
	acrescimo: number,
	juros: number,
	multa: number,
	valorPago: number,
) {
	const total =
		valorOriginal - desconto + acrescimo + juros + multa - valorPago;
	return Math.max(0, round2(total));
}

export function round2(n: number) {
	return Math.round(n * 100) / 100;
}

export { bankAccounts };
