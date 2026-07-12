import { relations } from "drizzle-orm";
import {
	doublePrecision,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { idColumn, softDeleteColumns } from "./columns";
import { plans } from "./plans";

export const companies = pgTable("companies", {
	id: idColumn(),
	corporateName: text("corporate_name").notNull(),
	tradeName: text("trade_name").notNull(),
	document: text("document").notNull().unique(),
	email: text("email").notNull().unique(),
	phone: text("phone").notNull(),
	website: text("website"),
	logo: text("logo"),
	zipCode: text("zip_code").notNull(),
	street: text("street").notNull(),
	number: text("number").notNull(),
	complement: text("complement"),
	district: text("district").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	latitude: doublePrecision("latitude"),
	longitude: doublePrecision("longitude"),
	planId: uuid("plan_id")
		.notNull()
		.references(() => plans.id),
	planExpiresAt: timestamp("plan_expires_at").defaultNow().notNull(),
	...softDeleteColumns,
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
});

export const companiesRelations = relations(companies, ({ one }) => ({
	plan: one(plans, {
		fields: [companies.planId],
		references: [plans.id],
	}),
}));

export const plansRelations = relations(plans, ({ many }) => ({
	companies: many(companies),
}));
