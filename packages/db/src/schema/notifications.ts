import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { appointments } from "./agendamentos";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const notifications = pgTable(
	"notifications",
	{
		id: idColumn(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		companyId: uuid("company_id").references(() => companies.id),
		title: text("title").notNull(),
		body: text("body").notNull(),
		kind: text("kind").notNull(),
		appointmentId: uuid("appointment_id").references(() => appointments.id),
		readAt: timestamp("read_at"),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("notifications_userId_idx").on(table.userId),
		index("notifications_companyId_idx").on(table.companyId),
		index("notifications_createdAt_idx").on(table.createdAt),
		index("notifications_readAt_idx").on(table.readAt),
	],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id],
	}),
	company: one(companies, {
		fields: [notifications.companyId],
		references: [companies.id],
	}),
	appointment: one(appointments, {
		fields: [notifications.appointmentId],
		references: [appointments.id],
	}),
}));
