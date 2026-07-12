import { relations } from "drizzle-orm";
import {
	doublePrecision,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const clients = pgTable(
	"clients",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		personType: text("person_type").notNull(),
		document: text("document").notNull(),
		name: text("name").notNull(),
		tradeName: text("trade_name"),
		email: text("email").notNull(),
		phone: text("phone").notNull(),
		zipCode: text("zip_code").notNull(),
		street: text("street").notNull(),
		number: text("number").notNull(),
		complement: text("complement"),
		district: text("district").notNull(),
		city: text("city").notNull(),
		state: text("state").notNull(),
		latitude: doublePrecision("latitude"),
		longitude: doublePrecision("longitude"),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		uniqueIndex("clients_company_document_ativo_idx").on(
			table.companyId,
			table.document,
		),
	],
);

export const clientsRelations = relations(clients, ({ one }) => ({
	company: one(companies, {
		fields: [clients.companyId],
		references: [companies.id],
	}),
}));
