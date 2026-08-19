import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

export const loginAccessLogs = pgTable(
	"login_access_logs",
	{
		id: idColumn(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		companyId: uuid("company_id").references(() => companies.id),
		sessionId: uuid("session_id"),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		country: text("country"),
		region: text("region"),
		city: text("city"),
		loggedAt: timestamp("logged_at").defaultNow().notNull(),
		...softDeleteColumns,
	},
	(table) => [
		index("login_access_logs_userId_idx").on(table.userId),
		index("login_access_logs_loggedAt_idx").on(table.loggedAt),
		index("login_access_logs_sessionId_idx").on(table.sessionId),
	],
);

export const loginAccessLogsRelations = relations(
	loginAccessLogs,
	({ one }) => ({
		user: one(user, {
			fields: [loginAccessLogs.userId],
			references: [user.id],
		}),
		company: one(companies, {
			fields: [loginAccessLogs.companyId],
			references: [companies.id],
		}),
	}),
);
