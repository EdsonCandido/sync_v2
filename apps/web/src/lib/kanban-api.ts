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
		| "attachment"
		| "recreated";
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

export type KanbanCardClient = {
	id: string;
	name: string;
	tradeName: string | null;
	document: string;
	email: string;
	phone: string;
	zipCode: string;
	street: string;
	number: string;
	complement: string | null;
	district: string;
	city: string;
	state: string;
};

export type KanbanCardFinancialEntry = {
	id: string;
	kind: "receber" | "pagar";
	status: "em_aberto" | "parcial" | "pago" | "cancelado" | "vencido";
	valorOriginal: number;
};

export type KanbanCardDetail = KanbanCard & {
	client: KanbanCardClient | null;
	history: KanbanHistoryItem[];
	attachments: KanbanAttachment[];
	financialEntries: KanbanCardFinancialEntry[];
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
	boardId: string;
	columns: KanbanColumn[];
};

export type KanbanBoardSummary = {
	id: string;
	name: string;
	isDefault: boolean;
	priority: number;
	createdBy: string | null;
	canManage: boolean;
	memberUserIds: string[];
};

export type KanbanSort = "createdAt" | "dueAt" | "title" | "position";

export type KanbanViewMode = "all" | "featured";

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

export type RecreateKanbanCardInput = {
	targetBoardId: string;
	assigneeUserIds: string[];
	copyHistory?: boolean;
	copyChecklist?: boolean;
	copyAttachments?: boolean;
};

export type RecreateKanbanCardResponse = {
	cardId: string;
	boardId: string;
	columnId: string;
};

export type CreateKanbanBoardInput = {
	name: string;
	priority?: number;
	memberUserIds?: string[];
};

export type UpdateKanbanBoardInput = {
	name?: string;
	priority?: number;
	memberUserIds?: string[];
};

export function kanbanPrefsKey(companyId: string, userId: string) {
	return `kanban-prefs:${companyId}:${userId}`;
}

export function loadKanbanPrefs(
	companyId: string,
	userId: string,
): { viewMode: KanbanViewMode; featuredBoardId: string | null } {
	try {
		const raw = localStorage.getItem(kanbanPrefsKey(companyId, userId));
		if (!raw) return { viewMode: "all", featuredBoardId: null };
		const parsed = JSON.parse(raw) as {
			viewMode?: KanbanViewMode;
			featuredBoardId?: string | null;
		};
		return {
			viewMode: parsed.viewMode === "featured" ? "featured" : "all",
			featuredBoardId: parsed.featuredBoardId ?? null,
		};
	} catch {
		return { viewMode: "all", featuredBoardId: null };
	}
}

export function saveKanbanPrefs(
	companyId: string,
	userId: string,
	prefs: { viewMode: KanbanViewMode; featuredBoardId: string | null },
) {
	localStorage.setItem(
		kanbanPrefsKey(companyId, userId),
		JSON.stringify(prefs),
	);
}

export const kanbanApi = {
	listBoards: () =>
		apiFetch<{ boards: KanbanBoardSummary[] }>("/api/kanban/boards"),
	createBoard: (body: CreateKanbanBoardInput) =>
		apiFetch<KanbanBoardSummary>("/api/kanban/boards", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateBoard: (boardId: string, body: UpdateKanbanBoardInput) =>
		apiFetch<KanbanBoardSummary>(`/api/kanban/boards/${boardId}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeBoard: (boardId: string) =>
		apiFetch(`/api/kanban/boards/${boardId}`, { method: "DELETE" }),
	getBoard: (params: {
		boardId: string;
		q?: string;
		assigneeUserId?: string;
		clientId?: string;
		tagId?: string;
		sort?: KanbanSort;
	}) => {
		const search = new URLSearchParams();
		search.set("boardId", params.boardId);
		if (params.q) search.set("q", params.q);
		if (params.assigneeUserId) {
			search.set("assigneeUserId", params.assigneeUserId);
		}
		if (params.clientId) search.set("clientId", params.clientId);
		if (params.tagId) search.set("tagId", params.tagId);
		if (params.sort) search.set("sort", params.sort);
		return apiFetch<KanbanBoard>(`/api/kanban/board?${search.toString()}`);
	},
	getFilterOptions: () =>
		apiFetch<{
			assignees: { id: string; name: string; email: string }[];
			clients: { id: string; name: string }[];
			tags: KanbanTag[];
		}>("/api/kanban/filter-options"),
	createColumn: (boardId: string, name: string) =>
		apiFetch<{ id: string; name: string; slug: string; isBase: boolean }>(
			"/api/kanban/columns",
			{ method: "POST", body: JSON.stringify({ boardId, name }) },
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
	recreateCard: (cardId: string, body: RecreateKanbanCardInput) =>
		apiFetch<RecreateKanbanCardResponse>(
			`/api/kanban/cards/${cardId}/recreate`,
			{
				method: "POST",
				body: JSON.stringify(body),
			},
		),
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
