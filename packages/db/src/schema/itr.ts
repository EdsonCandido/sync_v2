import { relations } from "drizzle-orm";
import {
	customType,
	doublePrecision,
	integer,
	pgTable,
	text,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { clients } from "./clients";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";
import { financialEntries } from "./financeiro";
import { kanbanCards } from "./kanban";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return "bytea";
	},
});

export const itrProcesses = pgTable("itr_processes", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	clientId: uuid("client_id")
		.notNull()
		.references(() => clients.id),
	kanbanCardId: uuid("kanban_card_id")
		.notNull()
		.references(() => kanbanCards.id),
	financialEntryId: uuid("financial_entry_id")
		.notNull()
		.references(() => financialEntries.id),
	valor: doublePrecision("valor").notNull(),
	observacoes: text("observacoes"),
	createdBy: uuid("created_by").references(() => user.id),
	updatedBy: uuid("updated_by").references(() => user.id),
	...softDeleteColumns,
});

export const itrFiles = pgTable("itr_files", {
	id: idColumn(),
	processId: uuid("process_id")
		.notNull()
		.references(() => itrProcesses.id),
	kind: text("kind").notNull().default("anexo"),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	sizeBytes: integer("size_bytes").notNull(),
	content: bytea("content").notNull(),
	uploadedBy: uuid("uploaded_by").references(() => user.id),
	...softDeleteColumns,
});

export const itrProcessesRelations = relations(itrProcesses, ({ one, many }) => ({
	company: one(companies, {
		fields: [itrProcesses.companyId],
		references: [companies.id],
	}),
	client: one(clients, {
		fields: [itrProcesses.clientId],
		references: [clients.id],
	}),
	kanbanCard: one(kanbanCards, {
		fields: [itrProcesses.kanbanCardId],
		references: [kanbanCards.id],
	}),
	financialEntry: one(financialEntries, {
		fields: [itrProcesses.financialEntryId],
		references: [financialEntries.id],
	}),
	files: many(itrFiles),
}));

export const itrFilesRelations = relations(itrFiles, ({ one }) => ({
	process: one(itrProcesses, {
		fields: [itrFiles.processId],
		references: [itrProcesses.id],
	}),
}));
