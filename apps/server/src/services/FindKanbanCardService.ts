import { KanbanAttachmentRepository } from "../repositories/KanbanAttachmentRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanChecklistRepository } from "../repositories/KanbanChecklistRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { KanbanTagRepository } from "../repositories/KanbanTagRepository";
import { AppError } from "../utils/AppError";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";

export class FindKanbanCardService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly checklistRepository = new KanbanChecklistRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
		private readonly tagRepository = new KanbanTagRepository(),
		private readonly attachmentRepository = new KanbanAttachmentRepository(),
	) {}

	async execute(
		id: string,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const row = await this.cardRepository.findByIdWithClient(
			id,
			params.companyId,
		);
		if (!row) {
			throw new AppError(404, "Card não encontrado.");
		}

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId: id,
			userId: params.userId,
			perfil: params.perfil,
		});

		const assignees = await this.cardRepository.listAssignees(id);
		const checklistItems = await this.checklistRepository.listByCard(id);
		const history = await this.historyRepository.listByCard(id);
		const tagRows = await this.tagRepository.listTagsForCards([id]);
		const attachments = await this.attachmentRepository.listByCard(id);
		const observationCount = history.filter(
			(h) => h.eventType === "observation",
		).length;

		return {
			id: row.card.id,
			companyId: row.card.companyId,
			columnId: row.card.columnId,
			title: row.card.title,
			description: row.card.description,
			clientId: row.card.clientId,
			clientName: row.clientName ?? null,
			dueAt: row.card.dueAt,
			position: row.card.position,
			assignees: assignees.map((a) => ({
				userId: a.userId,
				name: a.name,
				email: a.email,
			})),
			tags: tagRows.map((t) => ({
				id: t.id,
				name: t.name,
				slug: t.slug,
				color: t.color as "gray" | "blue" | "green" | "orange" | "purple",
			})),
			checklistItems: checklistItems.map((item) => ({
				id: item.id,
				title: item.title,
				done: item.done,
				position: item.position,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			checklistDoneCount: checklistItems.filter((i) => i.done).length,
			checklistTotalCount: checklistItems.length,
			observationCount,
			createdAt: row.card.createdAt,
			updatedAt: row.card.updatedAt,
			createdBy: row.card.createdBy,
			attachments: attachments.map((a) => ({
				id: a.id,
				originalName: a.originalName,
				mimeType: a.mimeType,
				sizeBytes: a.sizeBytes,
				uploadedBy: a.uploadedBy,
				createdAt: a.createdAt,
			})),
			history: history.map((h) => ({
				id: h.id,
				eventType: h.eventType,
				message: h.message,
				userId: h.userId,
				userName: h.userName ?? null,
				createdAt: h.createdAt,
			})),
		};
	}
}
