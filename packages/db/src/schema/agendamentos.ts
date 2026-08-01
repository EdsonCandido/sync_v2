import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const appointments = pgTable(
	"appointments",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		title: text("title").notNull(),
		notes: text("notes"),
		slotKind: text("slot_kind").notNull(),
		date: timestamp("date").notNull(),
		startsAt: timestamp("starts_at"),
		endsAt: timestamp("ends_at"),
		remindEnabled: boolean("remind_enabled").default(false).notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		index("appointments_companyId_idx").on(table.companyId),
		index("appointments_userId_idx").on(table.userId),
		index("appointments_date_idx").on(table.date),
		index("appointments_startsAt_idx").on(table.startsAt),
	],
);

export const appointmentReminderDeliveries = pgTable(
	"appointment_reminder_deliveries",
	{
		id: idColumn(),
		appointmentId: uuid("appointment_id")
			.notNull()
			.references(() => appointments.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		channel: text("channel").notNull(),
		...softDeleteColumns,
		createdBy: uuid("created_by"),
		updatedBy: uuid("updated_by"),
	},
	(table) => [
		uniqueIndex("appointment_reminder_deliveries_unique_idx").on(
			table.appointmentId,
			table.userId,
			table.channel,
		),
		index("appointment_reminder_deliveries_userId_idx").on(table.userId),
	],
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
	company: one(companies, {
		fields: [appointments.companyId],
		references: [companies.id],
	}),
	user: one(user, {
		fields: [appointments.userId],
		references: [user.id],
	}),
}));

export const appointmentReminderDeliveriesRelations = relations(
	appointmentReminderDeliveries,
	({ one }) => ({
		appointment: one(appointments, {
			fields: [appointmentReminderDeliveries.appointmentId],
			references: [appointments.id],
		}),
		user: one(user, {
			fields: [appointmentReminderDeliveries.userId],
			references: [user.id],
		}),
	}),
);
