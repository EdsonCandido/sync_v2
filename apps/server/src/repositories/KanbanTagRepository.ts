import { db } from "@sync_v2/db";
import { kanbanCardTags, kanbanTags } from "@sync_v2/db/schema/kanban";
import { and, asc, eq, inArray, notInArray } from "drizzle-orm";

const TAG_COLORS = ["gray", "blue", "green", "orange", "purple"] as const;

export class KanbanTagRepository {
	async listByCompany(companyId: string) {
		return db
			.select()
			.from(kanbanTags)
			.where(
				and(eq(kanbanTags.companyId, companyId), eq(kanbanTags.ativo, true)),
			)
			.orderBy(asc(kanbanTags.name));
	}

	async findBySlugAny(companyId: string, slug: string) {
		const [row] = await db
			.select()
			.from(kanbanTags)
			.where(
				and(eq(kanbanTags.companyId, companyId), eq(kanbanTags.slug, slug)),
			)
			.limit(1);
		return row ?? null;
	}

	async create(data: {
		companyId: string;
		name: string;
		slug: string;
		color: string;
	}) {
		const [row] = await db.insert(kanbanTags).values(data).returning();
		return row;
	}

	async reactivate(id: string, name: string) {
		const [row] = await db
			.update(kanbanTags)
			.set({ ativo: true, name, updatedAt: new Date() })
			.where(eq(kanbanTags.id, id))
			.returning();
		return row ?? null;
	}

	async listTagsForCards(cardIds: string[]) {
		if (cardIds.length === 0) return [];
		return db
			.select({
				cardId: kanbanCardTags.cardId,
				id: kanbanTags.id,
				name: kanbanTags.name,
				slug: kanbanTags.slug,
				color: kanbanTags.color,
			})
			.from(kanbanCardTags)
			.innerJoin(kanbanTags, eq(kanbanCardTags.tagId, kanbanTags.id))
			.where(
				and(
					inArray(kanbanCardTags.cardId, cardIds),
					eq(kanbanCardTags.ativo, true),
					eq(kanbanTags.ativo, true),
				),
			);
	}

	async listCardTagRows(cardId: string) {
		return db
			.select()
			.from(kanbanCardTags)
			.where(eq(kanbanCardTags.cardId, cardId));
	}

	async insertCardTag(cardId: string, tagId: string) {
		const [row] = await db
			.insert(kanbanCardTags)
			.values({ cardId, tagId })
			.returning();
		return row;
	}

	async activateCardTag(id: string) {
		const [row] = await db
			.update(kanbanCardTags)
			.set({ ativo: true, updatedAt: new Date() })
			.where(eq(kanbanCardTags.id, id))
			.returning();
		return row ?? null;
	}

	async softDeleteCardTagsNotIn(cardId: string, keepTagIds: string[]) {
		if (keepTagIds.length === 0) {
			await db
				.update(kanbanCardTags)
				.set({ ativo: false, updatedAt: new Date() })
				.where(
					and(
						eq(kanbanCardTags.cardId, cardId),
						eq(kanbanCardTags.ativo, true),
					),
				);
			return;
		}
		await db
			.update(kanbanCardTags)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanCardTags.cardId, cardId),
					eq(kanbanCardTags.ativo, true),
					notInArray(kanbanCardTags.tagId, keepTagIds),
				),
			);
	}

	nextColor(index: number) {
		return TAG_COLORS[index % TAG_COLORS.length] ?? "gray";
	}
}

export function slugifyTag(value: string) {
	return (
		value
			.normalize("NFD")
			.replace(/\p{M}/gu, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 40) || `tag-${Date.now()}`
	);
}
