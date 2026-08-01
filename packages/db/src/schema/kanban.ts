import { relations } from "drizzle-orm";
import {
	boolean,
	customType,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { clients } from "./clients";
import { idColumn, softDeleteColumns } from "./columns";
import { companies } from "./companies";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return "bytea";
	},
});

export const kanbanBoards = pgTable("kanban_boards", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	name: text("name").notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	priority: integer("priority").default(0).notNull(),
	createdBy: uuid("created_by").references(() => user.id),
	...softDeleteColumns,
});

export const kanbanBoardMembers = pgTable(
	"kanban_board_members",
	{
		id: idColumn(),
		boardId: uuid("board_id")
			.notNull()
			.references(() => kanbanBoards.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		...softDeleteColumns,
	},
	(table) => [
		uniqueIndex("kanban_board_members_board_user_idx").on(
			table.boardId,
			table.userId,
		),
	],
);

export const kanbanColumns = pgTable(
	"kanban_columns",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		boardId: uuid("board_id").references(() => kanbanBoards.id),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		isBase: boolean("is_base").default(false).notNull(),
		position: integer("position").notNull(),
		...softDeleteColumns,
	},
	(table) => [
		uniqueIndex("kanban_columns_board_slug_idx").on(table.boardId, table.slug),
	],
);

export const kanbanCards = pgTable("kanban_cards", {
	id: idColumn(),
	companyId: uuid("company_id")
		.notNull()
		.references(() => companies.id),
	columnId: uuid("column_id")
		.notNull()
		.references(() => kanbanColumns.id),
	title: text("title").notNull(),
	description: text("description"),
	clientId: uuid("client_id").references(() => clients.id),
	dueAt: timestamp("due_at"),
	position: integer("position").notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	...softDeleteColumns,
});

export const kanbanTags = pgTable(
	"kanban_tags",
	{
		id: idColumn(),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		color: text("color").default("gray").notNull(),
		...softDeleteColumns,
	},
	(table) => [
		uniqueIndex("kanban_tags_company_slug_idx").on(table.companyId, table.slug),
	],
);

export const kanbanCardTags = pgTable(
	"kanban_card_tags",
	{
		id: idColumn(),
		cardId: uuid("card_id")
			.notNull()
			.references(() => kanbanCards.id),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => kanbanTags.id),
		...softDeleteColumns,
	},
	(table) => [
		uniqueIndex("kanban_card_tags_card_tag_idx").on(table.cardId, table.tagId),
	],
);

export const kanbanCardAssignees = pgTable(
	"kanban_card_assignees",
	{
		id: idColumn(),
		cardId: uuid("card_id")
			.notNull()
			.references(() => kanbanCards.id),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id),
		...softDeleteColumns,
	},
	(table) => [
		uniqueIndex("kanban_card_assignees_card_user_idx").on(
			table.cardId,
			table.userId,
		),
	],
);

export const kanbanCardChecklistItems = pgTable("kanban_card_checklist_items", {
	id: idColumn(),
	cardId: uuid("card_id")
		.notNull()
		.references(() => kanbanCards.id),
	title: text("title").notNull(),
	done: boolean("done").default(false).notNull(),
	position: integer("position").notNull(),
	...softDeleteColumns,
});

export const kanbanCardHistory = pgTable("kanban_card_history", {
	id: idColumn(),
	cardId: uuid("card_id")
		.notNull()
		.references(() => kanbanCards.id),
	userId: uuid("user_id").references(() => user.id),
	eventType: text("event_type").notNull(),
	message: text("message").notNull(),
	...softDeleteColumns,
});

export const kanbanCardAttachments = pgTable("kanban_card_attachments", {
	id: idColumn(),
	cardId: uuid("card_id")
		.notNull()
		.references(() => kanbanCards.id),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	sizeBytes: integer("size_bytes").notNull(),
	content: bytea("content").notNull(),
	uploadedBy: uuid("uploaded_by").references(() => user.id),
	...softDeleteColumns,
});

export const kanbanBoardsRelations = relations(
	kanbanBoards,
	({ one, many }) => ({
		company: one(companies, {
			fields: [kanbanBoards.companyId],
			references: [companies.id],
		}),
		creator: one(user, {
			fields: [kanbanBoards.createdBy],
			references: [user.id],
		}),
		columns: many(kanbanColumns),
		members: many(kanbanBoardMembers),
	}),
);

export const kanbanBoardMembersRelations = relations(
	kanbanBoardMembers,
	({ one }) => ({
		board: one(kanbanBoards, {
			fields: [kanbanBoardMembers.boardId],
			references: [kanbanBoards.id],
		}),
		user: one(user, {
			fields: [kanbanBoardMembers.userId],
			references: [user.id],
		}),
	}),
);

export const kanbanColumnsRelations = relations(
	kanbanColumns,
	({ one, many }) => ({
		company: one(companies, {
			fields: [kanbanColumns.companyId],
			references: [companies.id],
		}),
		board: one(kanbanBoards, {
			fields: [kanbanColumns.boardId],
			references: [kanbanBoards.id],
		}),
		cards: many(kanbanCards),
	}),
);

export const kanbanCardsRelations = relations(kanbanCards, ({ one, many }) => ({
	company: one(companies, {
		fields: [kanbanCards.companyId],
		references: [companies.id],
	}),
	column: one(kanbanColumns, {
		fields: [kanbanCards.columnId],
		references: [kanbanColumns.id],
	}),
	client: one(clients, {
		fields: [kanbanCards.clientId],
		references: [clients.id],
	}),
	assignees: many(kanbanCardAssignees),
	checklistItems: many(kanbanCardChecklistItems),
	history: many(kanbanCardHistory),
	cardTags: many(kanbanCardTags),
	attachments: many(kanbanCardAttachments),
}));

export const kanbanTagsRelations = relations(kanbanTags, ({ one, many }) => ({
	company: one(companies, {
		fields: [kanbanTags.companyId],
		references: [companies.id],
	}),
	cardTags: many(kanbanCardTags),
}));

export const kanbanCardTagsRelations = relations(kanbanCardTags, ({ one }) => ({
	card: one(kanbanCards, {
		fields: [kanbanCardTags.cardId],
		references: [kanbanCards.id],
	}),
	tag: one(kanbanTags, {
		fields: [kanbanCardTags.tagId],
		references: [kanbanTags.id],
	}),
}));

export const kanbanCardAssigneesRelations = relations(
	kanbanCardAssignees,
	({ one }) => ({
		card: one(kanbanCards, {
			fields: [kanbanCardAssignees.cardId],
			references: [kanbanCards.id],
		}),
		user: one(user, {
			fields: [kanbanCardAssignees.userId],
			references: [user.id],
		}),
	}),
);

export const kanbanCardChecklistItemsRelations = relations(
	kanbanCardChecklistItems,
	({ one }) => ({
		card: one(kanbanCards, {
			fields: [kanbanCardChecklistItems.cardId],
			references: [kanbanCards.id],
		}),
	}),
);

export const kanbanCardHistoryRelations = relations(
	kanbanCardHistory,
	({ one }) => ({
		card: one(kanbanCards, {
			fields: [kanbanCardHistory.cardId],
			references: [kanbanCards.id],
		}),
		user: one(user, {
			fields: [kanbanCardHistory.userId],
			references: [user.id],
		}),
	}),
);

export const kanbanCardAttachmentsRelations = relations(
	kanbanCardAttachments,
	({ one }) => ({
		card: one(kanbanCards, {
			fields: [kanbanCardAttachments.cardId],
			references: [kanbanCards.id],
		}),
		uploader: one(user, {
			fields: [kanbanCardAttachments.uploadedBy],
			references: [user.id],
		}),
	}),
);
