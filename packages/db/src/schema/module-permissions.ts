import { relations } from "drizzle-orm";
import { boolean, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";

export const userModulePermissions = pgTable(
	"user_module_permissions",
	{
		id: idColumn(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		moduleKey: text("module_key").notNull(),
		canRead: boolean("can_read").default(false).notNull(),
		canEdit: boolean("can_edit").default(false).notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		uniqueIndex("user_module_permissions_user_module_idx").on(
			table.userId,
			table.moduleKey,
		),
	],
);

export const userModulePermissionsRelations = relations(
	userModulePermissions,
	({ one }) => ({
		user: one(user, {
			fields: [userModulePermissions.userId],
			references: [user.id],
		}),
	}),
);
