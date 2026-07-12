import { relations } from "drizzle-orm";
import {
	doublePrecision,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const companyRequests = pgTable(
	"company_requests",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		title: text("title").notNull(),
		status: text("status").notNull().default("pending"),
		requestedByUserId: uuid("requested_by_user_id").references(() => user.id),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("company_requests_companyId_idx").on(table.companyId),
		index("company_requests_status_idx").on(table.status),
	],
);

export const companyActivities = pgTable(
	"company_activities",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		action: text("action").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("company_activities_companyId_idx").on(table.companyId),
		index("company_activities_createdAt_idx").on(table.createdAt),
	],
);

export const companyContracts = pgTable(
	"company_contracts",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		title: text("title").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("company_contracts_companyId_idx").on(table.companyId),
		index("company_contracts_expiresAt_idx").on(table.expiresAt),
	],
);

export const companyPayments = pgTable(
	"company_payments",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		description: text("description").notNull(),
		amount: doublePrecision("amount").notNull(),
		status: text("status").notNull().default("pending"),
		dueDate: timestamp("due_date").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("company_payments_companyId_idx").on(table.companyId),
		index("company_payments_status_idx").on(table.status),
	],
);

export const accessEvents = pgTable(
	"access_events",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		accessedAt: timestamp("accessed_at").defaultNow().notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("access_events_companyId_idx").on(table.companyId),
		index("access_events_accessedAt_idx").on(table.accessedAt),
	],
);

export const companyRequestsRelations = relations(
	companyRequests,
	({ one }) => ({
		company: one(companies, {
			fields: [companyRequests.companyId],
			references: [companies.id],
		}),
		requestedBy: one(user, {
			fields: [companyRequests.requestedByUserId],
			references: [user.id],
		}),
	}),
);

export const companyActivitiesRelations = relations(
	companyActivities,
	({ one }) => ({
		company: one(companies, {
			fields: [companyActivities.companyId],
			references: [companies.id],
		}),
		user: one(user, {
			fields: [companyActivities.userId],
			references: [user.id],
		}),
	}),
);

export const companyContractsRelations = relations(
	companyContracts,
	({ one }) => ({
		company: one(companies, {
			fields: [companyContracts.companyId],
			references: [companies.id],
		}),
	}),
);

export const companyPaymentsRelations = relations(
	companyPayments,
	({ one }) => ({
		company: one(companies, {
			fields: [companyPayments.companyId],
			references: [companies.id],
		}),
	}),
);

export const accessEventsRelations = relations(accessEvents, ({ one }) => ({
	company: one(companies, {
		fields: [accessEvents.companyId],
		references: [companies.id],
	}),
	user: one(user, {
		fields: [accessEvents.userId],
		references: [user.id],
	}),
}));
