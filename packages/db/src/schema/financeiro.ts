import { relations } from "drizzle-orm";
import {
	boolean,
	customType,
	doublePrecision,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { clients } from "./clients";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";
import { kanbanCards } from "./kanban";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return "bytea";
	},
});

export const financialCategories = pgTable("financial_categories", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	name: text("name").notNull(),
	tipo: text("tipo").notNull(),
	cor: text("cor").notNull().default("gray"),
	icone: text("icone").notNull().default("tag"),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const costCenters = pgTable("cost_centers", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	name: text("name").notNull(),
	codigo: text("codigo").notNull(),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const bankAccounts = pgTable("bank_accounts", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	banco: text("banco").notNull(),
	agencia: text("agencia").notNull(),
	conta: text("conta").notNull(),
	tipo: text("tipo").notNull(),
	saldoInicial: doublePrecision("saldo_inicial").notNull().default(0),
	saldoAtual: doublePrecision("saldo_atual").notNull().default(0),
	dataSaldoInicial: timestamp("data_saldo_inicial").notNull(),
	cor: text("cor").notNull().default("blue"),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const suppliers = pgTable("suppliers", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	name: text("name").notNull(),
	document: text("document"),
	email: text("email"),
	phone: text("phone"),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const financialEntries = pgTable("financial_entries", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	kind: text("kind").notNull(),
	originType: text("origin_type").notNull().default("avulsa"),
	originLabel: text("origin_label"),
	kanbanCardId: uuid("kanban_card_id").references(() => kanbanCards.id),
	clientId: uuid("client_id").references(() => clients.id),
	supplierId: uuid("supplier_id").references(() => suppliers.id),
	categoryId: uuid("category_id").references(() => financialCategories.id),
	costCenterId: uuid("cost_center_id").references(() => costCenters.id),
	bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
	documento: text("documento"),
	numero: text("numero"),
	valorOriginal: doublePrecision("valor_original").notNull(),
	desconto: doublePrecision("desconto").notNull().default(0),
	acrescimo: doublePrecision("acrescimo").notNull().default(0),
	juros: doublePrecision("juros").notNull().default(0),
	multa: doublePrecision("multa").notNull().default(0),
	valorPago: doublePrecision("valor_pago").notNull().default(0),
	valorAberto: doublePrecision("valor_aberto").notNull(),
	dataEmissao: timestamp("data_emissao").notNull(),
	dataVencimento: timestamp("data_vencimento").notNull(),
	dataLiquidacao: timestamp("data_liquidacao"),
	status: text("status").notNull().default("em_aberto"),
	observacoes: text("observacoes"),
	installmentGroupId: uuid("installment_group_id"),
	installmentNumber: integer("installment_number"),
	installmentTotal: integer("installment_total"),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const financialEntryPayments = pgTable("financial_entry_payments", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	entryId: uuid("entry_id")
		.notNull()
		.references(() => financialEntries.id),
	bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
	valor: doublePrecision("valor").notNull(),
	juros: doublePrecision("juros").notNull().default(0),
	multa: doublePrecision("multa").notNull().default(0),
	desconto: doublePrecision("desconto").notNull().default(0),
	dataPagamento: timestamp("data_pagamento").notNull(),
	observacoes: text("observacoes"),
	estornado: boolean("estornado").notNull().default(false),
	estornadoEm: timestamp("estornado_em"),
	estornadoPor: uuid("estornado_por"),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const financialEntryHistory = pgTable("financial_entry_history", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	entryId: uuid("entry_id")
		.notNull()
		.references(() => financialEntries.id),
	action: text("action").notNull(),
	userId: uuid("user_id").references(() => user.id),
	ip: text("ip"),
	payload: jsonb("payload"),
	...softDeleteColumns,
});

export const financialEntryAttachments = pgTable(
	"financial_entry_attachments",
	{
		id: idColumn(),
		entryId: uuid("entry_id")
			.notNull()
			.references(() => financialEntries.id),
		originalName: text("original_name").notNull(),
		mimeType: text("mime_type").notNull(),
		sizeBytes: integer("size_bytes").notNull(),
		content: bytea("content").notNull(),
		uploadedBy: uuid("uploaded_by").references(() => user.id),
		...softDeleteColumns,
	},
);

export const financialCategoriesRelations = relations(
	financialCategories,
	({ one }) => ({
		company: one(companies, {
			fields: [financialCategories.companyId],
			references: [companies.id],
		}),
	}),
);

export const costCentersRelations = relations(costCenters, ({ one }) => ({
	company: one(companies, {
		fields: [costCenters.companyId],
		references: [companies.id],
	}),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one }) => ({
	company: one(companies, {
		fields: [bankAccounts.companyId],
		references: [companies.id],
	}),
}));

export const suppliersRelations = relations(suppliers, ({ one }) => ({
	company: one(companies, {
		fields: [suppliers.companyId],
		references: [companies.id],
	}),
}));

export const financialEntriesRelations = relations(
	financialEntries,
	({ one, many }) => ({
		company: one(companies, {
			fields: [financialEntries.companyId],
			references: [companies.id],
		}),
		client: one(clients, {
			fields: [financialEntries.clientId],
			references: [clients.id],
		}),
		supplier: one(suppliers, {
			fields: [financialEntries.supplierId],
			references: [suppliers.id],
		}),
		category: one(financialCategories, {
			fields: [financialEntries.categoryId],
			references: [financialCategories.id],
		}),
		costCenter: one(costCenters, {
			fields: [financialEntries.costCenterId],
			references: [costCenters.id],
		}),
		bankAccount: one(bankAccounts, {
			fields: [financialEntries.bankAccountId],
			references: [bankAccounts.id],
		}),
		kanbanCard: one(kanbanCards, {
			fields: [financialEntries.kanbanCardId],
			references: [kanbanCards.id],
		}),
		payments: many(financialEntryPayments),
		history: many(financialEntryHistory),
		attachments: many(financialEntryAttachments),
	}),
);

export const financialEntryPaymentsRelations = relations(
	financialEntryPayments,
	({ one }) => ({
		entry: one(financialEntries, {
			fields: [financialEntryPayments.entryId],
			references: [financialEntries.id],
		}),
		bankAccount: one(bankAccounts, {
			fields: [financialEntryPayments.bankAccountId],
			references: [bankAccounts.id],
		}),
	}),
);

export const financialEntryHistoryRelations = relations(
	financialEntryHistory,
	({ one }) => ({
		entry: one(financialEntries, {
			fields: [financialEntryHistory.entryId],
			references: [financialEntries.id],
		}),
	}),
);

export const financialEntryAttachmentsRelations = relations(
	financialEntryAttachments,
	({ one }) => ({
		entry: one(financialEntries, {
			fields: [financialEntryAttachments.entryId],
			references: [financialEntries.id],
		}),
	}),
);
