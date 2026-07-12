import {
	type KanbanTagRepository,
	slugifyTag,
} from "../repositories/KanbanTagRepository";

export async function syncCardTags(
	tagRepository: KanbanTagRepository,
	params: { companyId: string; cardId: string; tagNames: string[] },
) {
	const names = [
		...new Set(
			params.tagNames
				.map((n) => n.trim())
				.filter(Boolean)
				.map((n) => n.slice(0, 40)),
		),
	];

	const tagIds: string[] = [];
	let colorIndex = 0;

	for (const name of names) {
		const slug = slugifyTag(name);
		const existing = await tagRepository.findBySlugAny(params.companyId, slug);
		if (existing) {
			if (!existing.ativo) {
				await tagRepository.reactivate(existing.id, name);
			}
			tagIds.push(existing.id);
			continue;
		}
		const created = await tagRepository.create({
			companyId: params.companyId,
			name,
			slug,
			color: tagRepository.nextColor(colorIndex++),
		});
		if (created) tagIds.push(created.id);
	}

	await tagRepository.softDeleteCardTagsNotIn(params.cardId, tagIds);

	const existingLinks = await tagRepository.listCardTagRows(params.cardId);
	const byTagId = new Map(existingLinks.map((l) => [l.tagId, l]));

	for (const tagId of tagIds) {
		const link = byTagId.get(tagId);
		if (link) {
			if (!link.ativo) await tagRepository.activateCardTag(link.id);
		} else {
			await tagRepository.insertCardTag(params.cardId, tagId);
		}
	}

	return tagIds;
}
