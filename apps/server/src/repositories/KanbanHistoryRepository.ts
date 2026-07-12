import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { kanbanCardHistory } from "@sync_v2/db/schema/kanban";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export class KanbanHistoryRepository {
	async listByCard(cardId: string) {
		return db
			.select({
				id: kanbanCardHistory.id,
				eventType: kanbanCardHistory.eventType,
				message: kanbanCardHistory.message,
				userId: kanbanCardHistory.userId,
				userName: user.name,
				createdAt: kanbanCardHistory.createdAt,
			})
			.from(kanbanCardHistory)
			.leftJoin(user, eq(kanbanCardHistory.userId, user.id))
			.where(
				and(
					eq(kanbanCardHistory.cardId, cardId),
					eq(kanbanCardHistory.ativo, true),
				),
			)
			.orderBy(desc(kanbanCardHistory.createdAt));
	}

	async countObservationsByCardIds(cardIds: string[]) {
		if (cardIds.length === 0) return new Map<string, number>();
		const rows = await db
			.select({
				cardId: kanbanCardHistory.cardId,
				value: sql<number>`count(*)::int`,
			})
			.from(kanbanCardHistory)
			.where(
				and(
					inArray(kanbanCardHistory.cardId, cardIds),
					eq(kanbanCardHistory.ativo, true),
					eq(kanbanCardHistory.eventType, "observation"),
				),
			)
			.groupBy(kanbanCardHistory.cardId);

		return new Map(rows.map((r) => [r.cardId, r.value]));
	}

	async create(data: {
		cardId: string;
		userId?: string | null;
		eventType: string;
		message: string;
	}) {
		const [row] = await db
			.insert(kanbanCardHistory)
			.values({
				cardId: data.cardId,
				userId: data.userId ?? null,
				eventType: data.eventType,
				message: data.message,
			})
			.returning();
		return row;
	}
}
