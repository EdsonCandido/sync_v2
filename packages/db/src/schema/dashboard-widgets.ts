import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const dashboardFavorites = pgTable(
	"dashboard_favorites",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		label: text("label").notNull(),
		path: text("path").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("dashboard_favorites_userId_idx").on(table.userId),
		index("dashboard_favorites_companyId_idx").on(table.companyId),
	],
);

export const dashboardGoals = pgTable(
	"dashboard_goals",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		label: text("label").notNull(),
		progress: integer("progress").notNull().default(0),
		targetLabel: text("target_label").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [index("dashboard_goals_companyId_idx").on(table.companyId)],
);

export const dashboardWidgetLayouts = pgTable(
	"dashboard_widget_layouts",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		widgetOrder: text("widget_order").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		uniqueIndex("dashboard_widget_layouts_user_company_idx").on(
			table.userId,
			table.companyId,
		),
		index("dashboard_widget_layouts_companyId_idx").on(table.companyId),
	],
);

export const dashboardFavoritesRelations = relations(
	dashboardFavorites,
	({ one }) => ({
		company: one(companies, {
			fields: [dashboardFavorites.companyId],
			references: [companies.id],
		}),
		user: one(user, {
			fields: [dashboardFavorites.userId],
			references: [user.id],
		}),
	}),
);

export const dashboardGoalsRelations = relations(dashboardGoals, ({ one }) => ({
	company: one(companies, {
		fields: [dashboardGoals.companyId],
		references: [companies.id],
	}),
}));

export const dashboardWidgetLayoutsRelations = relations(
	dashboardWidgetLayouts,
	({ one }) => ({
		company: one(companies, {
			fields: [dashboardWidgetLayouts.companyId],
			references: [companies.id],
		}),
		user: one(user, {
			fields: [dashboardWidgetLayouts.userId],
			references: [user.id],
		}),
	}),
);
