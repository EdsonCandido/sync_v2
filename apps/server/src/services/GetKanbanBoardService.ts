import type { ListKanbanBoardQuery } from "@sync_v2/contracts";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { AppError } from "../utils/AppError";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";

function mapCard(
	card: Awaited<ReturnType<KanbanCardRepository["listByCompany"]>>[number],
) {
	return {
		id: card.id,
		companyId: card.companyId,
		columnId: card.columnId,
		title: card.title,
		description: card.description,
		clientId: card.clientId,
		clientName: card.clientName,
		dueAt: card.dueAt,
		position: card.position,
		assignees: card.assignees,
		tags: card.tags.map((t) => ({
			id: t.id,
			name: t.name,
			slug: t.slug,
			color: t.color as "gray" | "blue" | "green" | "orange" | "purple",
		})),
		checklistItems: card.checklistItems,
		checklistDoneCount: card.checklistDoneCount,
		checklistTotalCount: card.checklistTotalCount,
		observationCount: card.observationCount,
		createdAt: card.createdAt,
		updatedAt: card.updatedAt,
		createdBy: card.createdBy,
	};
}

export class GetKanbanBoardService {
	constructor(
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly cardRepository = new KanbanCardRepository(),
	) {}

	async execute(
		query: ListKanbanBoardQuery,
		params: {
			companyId: string;
			userId: string;
			perfil: string;
		},
	) {
		if (params.perfil !== "admin_empresa" && params.perfil !== "cliente") {
			throw new AppError(403, "Sem permissão para o Kanban.");
		}

		await this.ensureBase.execute(params.companyId);
		const columns = await this.columnRepository.listByCompany(params.companyId);

		const cards = await this.cardRepository.listByCompany({
			companyId: params.companyId,
			assigneeUserId: query.assigneeUserId,
			clientId: query.clientId,
			tagId: query.tagId,
			q: query.q,
			sort: query.sort,
			onlyAssigneeUserId:
				params.perfil === "cliente" ? params.userId : undefined,
		});

		const cardsByColumn = new Map<string, typeof cards>();
		for (const card of cards) {
			const list = cardsByColumn.get(card.columnId) ?? [];
			list.push(card);
			cardsByColumn.set(card.columnId, list);
		}

		return {
			columns: columns.map((col) => ({
				id: col.id,
				name: col.name,
				slug: col.slug,
				isBase: col.isBase,
				position: col.position,
				cards: (cardsByColumn.get(col.id) ?? []).map(mapCard),
			})),
		};
	}
}
