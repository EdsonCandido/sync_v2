import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { idColumn, softDeleteColumns } from "./columns";

export const plans = pgTable("plans", {
	id: idColumn(),
	name: text("name").notNull(),
	description: text("description"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	...softDeleteColumns,
});
