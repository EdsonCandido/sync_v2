import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { idColumn, softDeleteColumns } from "./columns";

export const plans = pgTable("plans", {
	id: idColumn(),
	name: text("name").notNull(),
	description: text("description"),
	durationDays: integer("duration_days").notNull(),
	...softDeleteColumns,
});
