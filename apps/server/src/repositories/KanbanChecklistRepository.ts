import { db } from "@sync_v2/db";
import { kanbanCardChecklistItems } from "@sync_v2/db/schema/kanban";
import { and, asc, eq, max } from "drizzle-orm";

export class KanbanChecklistRepository {
	async listByCard(cardId: string) {
		return db
			.select()
			.from(kanbanCardChecklistItems)
			.where(
				and(
					eq(kanbanCardChecklistItems.cardId, cardId),
					eq(kanbanCardChecklistItems.ativo, true),
				),
			)
			.orderBy(asc(kanbanCardChecklistItems.position));
	}

	async findById(id: string, cardId: string) {
		const [row] = await db
			.select()
			.from(kanbanCardChecklistItems)
			.where(
				and(
					eq(kanbanCardChecklistItems.id, id),
					eq(kanbanCardChecklistItems.cardId, cardId),
					eq(kanbanCardChecklistItems.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async nextPosition(cardId: string) {
		const [row] = await db
			.select({ value: max(kanbanCardChecklistItems.position) })
			.from(kanbanCardChecklistItems)
			.where(
				and(
					eq(kanbanCardChecklistItems.cardId, cardId),
					eq(kanbanCardChecklistItems.ativo, true),
				),
			);
		return (row?.value ?? -1) + 1;
	}

	async create(data: { cardId: string; title: string; position: number }) {
		const [row] = await db
			.insert(kanbanCardChecklistItems)
			.values({
				cardId: data.cardId,
				title: data.title,
				position: data.position,
				done: false,
			})
			.returning();
		return row;
	}

	async createMany(
		items: { cardId: string; title: string; position: number }[],
	) {
		if (items.length === 0) return [];
		return db
			.insert(kanbanCardChecklistItems)
			.values(
				items.map((item) => ({
					cardId: item.cardId,
					title: item.title,
					position: item.position,
					done: false,
				})),
			)
			.returning();
	}

	async update(
		id: string,
		cardId: string,
		data: { title?: string; done?: boolean },
	) {
		const [row] = await db
			.update(kanbanCardChecklistItems)
			.set({
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.done !== undefined ? { done: data.done } : {}),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(kanbanCardChecklistItems.id, id),
					eq(kanbanCardChecklistItems.cardId, cardId),
					eq(kanbanCardChecklistItems.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, cardId: string) {
		const [row] = await db
			.update(kanbanCardChecklistItems)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanCardChecklistItems.id, id),
					eq(kanbanCardChecklistItems.cardId, cardId),
					eq(kanbanCardChecklistItems.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
