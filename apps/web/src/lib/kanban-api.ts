import { apiFetch, apiFetchBlob } from "./api";

export type KanbanAssignee = {
	userId: string;
	name: string;
	email: string;
};

export type KanbanTag = {
	id: string;
	name: string;
	slug: string;
	color: "gray" | "blue" | "green" | "orange" | "purple";
};

export type KanbanChecklistItem = {
	id: string;
	title: string;
	done: boolean;
	position: number;
	createdAt: string;
	updatedAt: string;
};

export type KanbanAttachment = {
	id: string;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	uploadedBy: string | null;
	createdAt: string;
};

export type KanbanHistoryItem = {
	id: string;
	eventType:
		| "created"
		| "updated"
		| "moved"
		| "observation"
		| "checklist"
		| "assignees"
		| "tags"
		| "attachment";
	message: string;
	userId: string | null;
	userName: string | null;
	createdAt: string;
};

export type KanbanCard = {
	id: string;
	companyId: string;
	columnId: string;
	title: string;
	description: string | null;
	clientId: string | null;
	clientName: string | null;
	dueAt: string | null;
	position: number;
	assignees: KanbanAssignee[];
	tags: KanbanTag[];
	checklistItems: KanbanChecklistItem[];
	checklistDoneCount: number;
	checklistTotalCount: number;
	observationCount: number;
	createdAt: string;
	updatedAt: string;
	createdBy: string | null;
};

export type KanbanCardDetail = KanbanCard & {
	history: KanbanHistoryItem[];
	attachments: KanbanAttachment[];
};

export type KanbanColumn = {
	id: string;
	name: string;
	slug: string;
	isBase: boolean;
	position: number;
	cards: KanbanCard[];
};

export type KanbanBoard = {
	columns: KanbanColumn[];
};

export type KanbanSort = "createdAt" | "dueAt" | "title" | "position";

export type CreateKanbanCardInput = {
	columnId: string;
	title: string;
	description?: string | null;
	clientId?: string | null;
	dueAt?: string | null;
	tagNames?: string[];
	assigneeUserIds: string[];
};

export type UpdateKanbanCardInput = {
	title?: string;
	description?: string | null;
	clientId?: string | null;
	dueAt?: string | null;
	tagNames?: string[];
	assigneeUserIds?: string[];
};

export const kanbanApi = {
	getBoard: (params?: {
		q?: string;
		assigneeUserId?: string;
		clientId?: string;
		tagId?: string;
		sort?: KanbanSort;
	}) => {
		const search = new URLSearchParams();
		if (params?.q) search.set("q", params.q);
		if (params?.assigneeUserId) {
			search.set("assigneeUserId", params.assigneeUserId);
		}
		if (params?.clientId) search.set("clientId", params.clientId);
		if (params?.tagId) search.set("tagId", params.tagId);
		if (params?.sort) search.set("sort", params.sort);
		const qs = search.toString();
		return apiFetch<KanbanBoard>(`/api/kanban/board${qs ? `?${qs}` : ""}`);
	},
	getFilterOptions: () =>
		apiFetch<{
			assignees: { id: string; name: string; email: string }[];
			clients: { id: string; name: string }[];
			tags: KanbanTag[];
		}>("/api/kanban/filter-options"),
	createColumn: (name: string) =>
		apiFetch<{ id: string; name: string; slug: string; isBase: boolean }>(
			"/api/kanban/columns",
			{ method: "POST", body: JSON.stringify({ name }) },
		),
	removeColumn: (columnId: string) =>
		apiFetch(`/api/kanban/columns/${columnId}`, { method: "DELETE" }),
	createCard: (body: CreateKanbanCardInput) =>
		apiFetch<KanbanCard>("/api/kanban/cards", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	getCard: (cardId: string) =>
		apiFetch<KanbanCardDetail>(`/api/kanban/cards/${cardId}`),
	updateCard: (cardId: string, body: UpdateKanbanCardInput) =>
		apiFetch<KanbanCard>(`/api/kanban/cards/${cardId}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	moveCard: (cardId: string, body: { columnId: string; position: number }) =>
		apiFetch<KanbanCard>(`/api/kanban/cards/${cardId}/move`, {
			method: "PATCH",
			body: JSON.stringify(body),
		}),
	removeCard: (cardId: string) =>
		apiFetch(`/api/kanban/cards/${cardId}`, { method: "DELETE" }),
	addChecklistItem: (cardId: string, title: string) =>
		apiFetch<KanbanChecklistItem>(`/api/kanban/cards/${cardId}/checklist`, {
			method: "POST",
			body: JSON.stringify({ title }),
		}),
	updateChecklistItem: (
		cardId: string,
		itemId: string,
		body: { title?: string; done?: boolean },
	) =>
		apiFetch<KanbanChecklistItem>(
			`/api/kanban/cards/${cardId}/checklist/${itemId}`,
			{ method: "PATCH", body: JSON.stringify(body) },
		),
	removeChecklistItem: (cardId: string, itemId: string) =>
		apiFetch(`/api/kanban/cards/${cardId}/checklist/${itemId}`, {
			method: "DELETE",
		}),
	addObservation: (cardId: string, message: string) =>
		apiFetch(`/api/kanban/cards/${cardId}/observations`, {
			method: "POST",
			body: JSON.stringify({ message }),
		}),
	uploadAttachment: (cardId: string, file: File) => {
		const body = new FormData();
		body.append("file", file);
		return apiFetch<KanbanAttachment>(
			`/api/kanban/cards/${cardId}/attachments`,
			{ method: "POST", body },
		);
	},
	downloadAttachment: async (cardId: string, attachmentId: string) => {
		const { blob, filename } = await apiFetchBlob(
			`/api/kanban/cards/${cardId}/attachments/${attachmentId}/download`,
		);
		return { blob, filename };
	},
	removeAttachment: (cardId: string, attachmentId: string) =>
		apiFetch(`/api/kanban/cards/${cardId}/attachments/${attachmentId}`, {
			method: "DELETE",
		}),
};
