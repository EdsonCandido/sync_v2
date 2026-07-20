import { db } from "@sync_v2/db";
import { kanbanCardAttachments } from "@sync_v2/db/schema/kanban";
import { and, asc, count, eq } from "drizzle-orm";

const metadataColumns = {
	id: kanbanCardAttachments.id,
	cardId: kanbanCardAttachments.cardId,
	originalName: kanbanCardAttachments.originalName,
	mimeType: kanbanCardAttachments.mimeType,
	sizeBytes: kanbanCardAttachments.sizeBytes,
	uploadedBy: kanbanCardAttachments.uploadedBy,
	createdAt: kanbanCardAttachments.createdAt,
	updatedAt: kanbanCardAttachments.updatedAt,
	ativo: kanbanCardAttachments.ativo,
};

export class KanbanAttachmentRepository {
	async listByCard(cardId: string) {
		return db
			.select(metadataColumns)
			.from(kanbanCardAttachments)
			.where(
				and(
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			)
			.orderBy(asc(kanbanCardAttachments.createdAt));
	}

	async listWithContentByCard(cardId: string) {
		return db
			.select()
			.from(kanbanCardAttachments)
			.where(
				and(
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			)
			.orderBy(asc(kanbanCardAttachments.createdAt));
	}

	async countActiveByCard(cardId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(kanbanCardAttachments)
			.where(
				and(
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			);
		return Number(row?.value ?? 0);
	}

	async findById(id: string, cardId: string) {
		const [row] = await db
			.select()
			.from(kanbanCardAttachments)
			.where(
				and(
					eq(kanbanCardAttachments.id, id),
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findMetadataById(id: string, cardId: string) {
		const [row] = await db
			.select(metadataColumns)
			.from(kanbanCardAttachments)
			.where(
				and(
					eq(kanbanCardAttachments.id, id),
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(data: {
		cardId: string;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
		content: Buffer;
		uploadedBy: string;
	}) {
		const [row] = await db
			.insert(kanbanCardAttachments)
			.values({
				cardId: data.cardId,
				originalName: data.originalName,
				mimeType: data.mimeType,
				sizeBytes: data.sizeBytes,
				content: data.content,
				uploadedBy: data.uploadedBy,
			})
			.returning(metadataColumns);
		return row;
	}

	async softDelete(id: string, cardId: string) {
		const [row] = await db
			.update(kanbanCardAttachments)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanCardAttachments.id, id),
					eq(kanbanCardAttachments.cardId, cardId),
					eq(kanbanCardAttachments.ativo, true),
				),
			)
			.returning(metadataColumns);
		return row ?? null;
	}
}
