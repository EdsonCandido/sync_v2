import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { clients } from "@sync_v2/db/schema/clients";
import {
	kanbanCardAssignees,
	kanbanCardChecklistItems,
	kanbanCards,
} from "@sync_v2/db/schema/kanban";
import { and, asc, eq, inArray, max, notInArray } from "drizzle-orm";
import { KanbanHistoryRepository } from "./KanbanHistoryRepository";
import { KanbanTagRepository } from "./KanbanTagRepository";

export class KanbanCardRepository {
	constructor(
		private readonly tagRepository = new KanbanTagRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
	) {}

	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(kanbanCards)
			.where(
				and(
					eq(kanbanCards.id, id),
					eq(kanbanCards.companyId, companyId),
					eq(kanbanCards.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findByIdWithClient(id: string, companyId: string) {
		const [row] = await db
			.select({
				card: kanbanCards,
				clientName: clients.name,
			})
			.from(kanbanCards)
			.leftJoin(clients, eq(kanbanCards.clientId, clients.id))
			.where(
				and(
					eq(kanbanCards.id, id),
					eq(kanbanCards.companyId, companyId),
					eq(kanbanCards.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async listByCompany(params: {
		companyId: string;
		assigneeUserId?: string;
		clientId?: string;
		onlyAssigneeUserId?: string;
		tagId?: string;
		q?: string;
		sort?: "createdAt" | "dueAt" | "title" | "position";
	}) {
		const conditions = [
			eq(kanbanCards.companyId, params.companyId),
			eq(kanbanCards.ativo, true),
		];

		if (params.clientId) {
			conditions.push(eq(kanbanCards.clientId, params.clientId));
		}

		let rows = await db
			.select({
				card: kanbanCards,
				clientName: clients.name,
			})
			.from(kanbanCards)
			.leftJoin(clients, eq(kanbanCards.clientId, clients.id))
			.where(and(...conditions))
			.orderBy(asc(kanbanCards.position), asc(kanbanCards.createdAt));

		const cardIds = rows.map((r) => r.card.id);
		if (cardIds.length === 0) {
			return [];
		}

		const [assignees, checklist, tagRows, observationCounts] =
			await Promise.all([
				db
					.select({
						cardId: kanbanCardAssignees.cardId,
						userId: kanbanCardAssignees.userId,
						name: user.name,
						email: user.email,
					})
					.from(kanbanCardAssignees)
					.innerJoin(user, eq(kanbanCardAssignees.userId, user.id))
					.where(
						and(
							inArray(kanbanCardAssignees.cardId, cardIds),
							eq(kanbanCardAssignees.ativo, true),
						),
					),
				db
					.select()
					.from(kanbanCardChecklistItems)
					.where(
						and(
							inArray(kanbanCardChecklistItems.cardId, cardIds),
							eq(kanbanCardChecklistItems.ativo, true),
						),
					)
					.orderBy(asc(kanbanCardChecklistItems.position)),
				this.tagRepository.listTagsForCards(cardIds),
				this.historyRepository.countObservationsByCardIds(cardIds),
			]);

		const assigneesByCard = new Map<
			string,
			{ userId: string; name: string; email: string }[]
		>();
		for (const a of assignees) {
			const list = assigneesByCard.get(a.cardId) ?? [];
			list.push({ userId: a.userId, name: a.name, email: a.email });
			assigneesByCard.set(a.cardId, list);
		}

		const checklistByCard = new Map<string, typeof checklist>();
		for (const item of checklist) {
			const list = checklistByCard.get(item.cardId) ?? [];
			list.push(item);
			checklistByCard.set(item.cardId, list);
		}

		const tagsByCard = new Map<
			string,
			{ id: string; name: string; slug: string; color: string }[]
		>();
		for (const t of tagRows) {
			const list = tagsByCard.get(t.cardId) ?? [];
			list.push({
				id: t.id,
				name: t.name,
				slug: t.slug,
				color: t.color,
			});
			tagsByCard.set(t.cardId, list);
		}

		if (params.onlyAssigneeUserId) {
			rows = rows.filter((r) =>
				(assigneesByCard.get(r.card.id) ?? []).some(
					(a) => a.userId === params.onlyAssigneeUserId,
				),
			);
		}

		if (params.assigneeUserId) {
			rows = rows.filter((r) =>
				(assigneesByCard.get(r.card.id) ?? []).some(
					(a) => a.userId === params.assigneeUserId,
				),
			);
		}

		if (params.tagId) {
			rows = rows.filter((r) =>
				(tagsByCard.get(r.card.id) ?? []).some((t) => t.id === params.tagId),
			);
		}

		if (params.q?.trim()) {
			const q = params.q.trim().toLowerCase();
			rows = rows.filter((r) => {
				const tags = tagsByCard.get(r.card.id) ?? [];
				return (
					r.card.title.toLowerCase().includes(q) ||
					(r.card.description ?? "").toLowerCase().includes(q) ||
					(r.clientName ?? "").toLowerCase().includes(q) ||
					tags.some((t) => t.name.toLowerCase().includes(q))
				);
			});
		}

		const mapped = rows.map((r) => {
			const items = checklistByCard.get(r.card.id) ?? [];
			return {
				...r.card,
				clientName: r.clientName ?? null,
				assignees: assigneesByCard.get(r.card.id) ?? [],
				tags: tagsByCard.get(r.card.id) ?? [],
				checklistItems: items.map((item) => ({
					id: item.id,
					title: item.title,
					done: item.done,
					position: item.position,
					createdAt: item.createdAt,
					updatedAt: item.updatedAt,
				})),
				checklistDoneCount: items.filter((i) => i.done).length,
				checklistTotalCount: items.length,
				observationCount: observationCounts.get(r.card.id) ?? 0,
			};
		});

		const sort = params.sort ?? "position";
		mapped.sort((a, b) => {
			if (sort === "title") return a.title.localeCompare(b.title, "pt-BR");
			if (sort === "dueAt") {
				const ad = a.dueAt?.getTime() ?? Number.POSITIVE_INFINITY;
				const bd = b.dueAt?.getTime() ?? Number.POSITIVE_INFINITY;
				return ad - bd;
			}
			if (sort === "createdAt") {
				return b.createdAt.getTime() - a.createdAt.getTime();
			}
			return a.position - b.position;
		});

		return mapped;
	}

	async nextPosition(columnId: string) {
		const [row] = await db
			.select({ value: max(kanbanCards.position) })
			.from(kanbanCards)
			.where(
				and(eq(kanbanCards.columnId, columnId), eq(kanbanCards.ativo, true)),
			);
		return (row?.value ?? -1) + 1;
	}

	async create(data: {
		companyId: string;
		columnId: string;
		title: string;
		description?: string | null;
		clientId?: string | null;
		dueAt?: Date | null;
		position: number;
		createdBy: string;
	}) {
		const [row] = await db
			.insert(kanbanCards)
			.values({
				companyId: data.companyId,
				columnId: data.columnId,
				title: data.title,
				description: data.description ?? null,
				clientId: data.clientId ?? null,
				dueAt: data.dueAt ?? null,
				position: data.position,
				createdBy: data.createdBy,
				updatedBy: data.createdBy,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: {
			title?: string;
			description?: string | null;
			clientId?: string | null;
			dueAt?: Date | null;
			updatedBy: string;
		},
	) {
		const [row] = await db
			.update(kanbanCards)
			.set({
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.description !== undefined
					? { description: data.description }
					: {}),
				...(data.clientId !== undefined ? { clientId: data.clientId } : {}),
				...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
				updatedBy: data.updatedBy,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(kanbanCards.id, id),
					eq(kanbanCards.companyId, companyId),
					eq(kanbanCards.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async move(
		id: string,
		companyId: string,
		data: { columnId: string; position: number; updatedBy: string },
	) {
		const [row] = await db
			.update(kanbanCards)
			.set({
				columnId: data.columnId,
				position: data.position,
				updatedBy: data.updatedBy,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(kanbanCards.id, id),
					eq(kanbanCards.companyId, companyId),
					eq(kanbanCards.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy: string) {
		const [row] = await db
			.update(kanbanCards)
			.set({
				ativo: false,
				updatedBy,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(kanbanCards.id, id),
					eq(kanbanCards.companyId, companyId),
					eq(kanbanCards.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async listAssignees(cardId: string) {
		return db
			.select({
				id: kanbanCardAssignees.id,
				cardId: kanbanCardAssignees.cardId,
				userId: kanbanCardAssignees.userId,
				ativo: kanbanCardAssignees.ativo,
				name: user.name,
				email: user.email,
			})
			.from(kanbanCardAssignees)
			.innerJoin(user, eq(kanbanCardAssignees.userId, user.id))
			.where(
				and(
					eq(kanbanCardAssignees.cardId, cardId),
					eq(kanbanCardAssignees.ativo, true),
				),
			);
	}

	async findAssigneeRow(cardId: string, userId: string) {
		const [row] = await db
			.select()
			.from(kanbanCardAssignees)
			.where(
				and(
					eq(kanbanCardAssignees.cardId, cardId),
					eq(kanbanCardAssignees.userId, userId),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async activateAssignee(id: string) {
		const [row] = await db
			.update(kanbanCardAssignees)
			.set({ ativo: true, updatedAt: new Date() })
			.where(eq(kanbanCardAssignees.id, id))
			.returning();
		return row ?? null;
	}

	async insertAssignee(cardId: string, userId: string) {
		const [row] = await db
			.insert(kanbanCardAssignees)
			.values({ cardId, userId })
			.returning();
		return row;
	}

	async softDeleteAssigneesNotIn(cardId: string, keepUserIds: string[]) {
		if (keepUserIds.length === 0) {
			await db
				.update(kanbanCardAssignees)
				.set({ ativo: false, updatedAt: new Date() })
				.where(
					and(
						eq(kanbanCardAssignees.cardId, cardId),
						eq(kanbanCardAssignees.ativo, true),
					),
				);
			return;
		}
		await db
			.update(kanbanCardAssignees)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanCardAssignees.cardId, cardId),
					eq(kanbanCardAssignees.ativo, true),
					notInArray(kanbanCardAssignees.userId, keepUserIds),
				),
			);
	}

	async isUserAssignee(cardId: string, userId: string) {
		const [row] = await db
			.select({ id: kanbanCardAssignees.id })
			.from(kanbanCardAssignees)
			.where(
				and(
					eq(kanbanCardAssignees.cardId, cardId),
					eq(kanbanCardAssignees.userId, userId),
					eq(kanbanCardAssignees.ativo, true),
				),
			)
			.limit(1);
		return Boolean(row);
	}
}
