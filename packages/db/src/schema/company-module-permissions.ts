import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const companyModulePermissions = pgTable(
	"company_module_permissions",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id, { onDelete: "cascade" }),
		moduleKey: text("module_key").notNull(),
		canAccess: boolean("can_access").default(false).notNull(),
		canLiberate: boolean("can_liberate").default(false).notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		uniqueIndex("company_module_permissions_company_module_idx").on(
			table.companyId,
			table.moduleKey,
		),
	],
);

export const companyModulePermissionsRelations = relations(
	companyModulePermissions,
	({ one }) => ({
		company: one(companies, {
			fields: [companyModulePermissions.companyId],
			references: [companies.id],
		}),
	}),
);
