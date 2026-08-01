import { db } from "@sync_v2/db";
import { notifications } from "@sync_v2/db/schema/notifications";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export class NotificationRepository {
	async listByUser(userId: string, limit = 40) {
		return db
			.select()
			.from(notifications)
			.where(
				and(eq(notifications.userId, userId), eq(notifications.ativo, true)),
			)
			.orderBy(desc(notifications.createdAt))
			.limit(limit);
	}

	async countUnread(userId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(notifications)
			.where(
				and(
					eq(notifications.userId, userId),
					eq(notifications.ativo, true),
					isNull(notifications.readAt),
				),
			);
		return row?.value ?? 0;
	}

	async findById(id: string, userId: string) {
		const [row] = await db
			.select()
			.from(notifications)
			.where(
				and(
					eq(notifications.id, id),
					eq(notifications.userId, userId),
					eq(notifications.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(params: {
		userId: string;
		companyId?: string | null;
		title: string;
		body: string;
		kind: string;
		appointmentId?: string | null;
		createdBy?: string | null;
	}) {
		const [row] = await db
			.insert(notifications)
			.values({
				userId: params.userId,
				companyId: params.companyId ?? null,
				title: params.title,
				body: params.body,
				kind: params.kind,
				appointmentId: params.appointmentId ?? null,
				createdBy: params.createdBy ?? null,
				updatedBy: params.createdBy ?? null,
			})
			.returning();
		return row;
	}

	async markRead(id: string, userId: string) {
		const [row] = await db
			.update(notifications)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notifications.id, id),
					eq(notifications.userId, userId),
					eq(notifications.ativo, true),
					isNull(notifications.readAt),
				),
			)
			.returning();
		return row ?? null;
	}

	async markAllRead(userId: string) {
		await db
			.update(notifications)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notifications.userId, userId),
					eq(notifications.ativo, true),
					isNull(notifications.readAt),
				),
			);
	}
}
