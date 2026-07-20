import type { RecreateKanbanCardInput } from "@sync_v2/contracts";
import { KanbanAttachmentRepository } from "../repositories/KanbanAttachmentRepository";
import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanChecklistRepository } from "../repositories/KanbanChecklistRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { KanbanTagRepository } from "../repositories/KanbanTagRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { validateAssignees } from "./CreateKanbanCardService";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";
import { assertCanAccessKanbanBoard } from "./KanbanBoardAccessRules";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";
import { syncCardTags } from "./SyncKanbanCardTagsService";

const MAX_ATTACHMENTS_PER_CARD = 20;

export class RecreateKanbanCardService {
	constructor(
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
		private readonly boardRepository = new KanbanBoardRepository(),
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
		private readonly checklistRepository = new KanbanChecklistRepository(),
		private readonly attachmentRepository = new KanbanAttachmentRepository(),
		private readonly tagRepository = new KanbanTagRepository(),
		private readonly userRepository = new UserRepository(),
	) {}

	async execute(
		sourceCardId: string,
		input: RecreateKanbanCardInput,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const sourceCard = await this.cardRepository.findById(
			sourceCardId,
			params.companyId,
		);
		if (!sourceCard) {
			throw new AppError(404, "Card não encontrado.");
		}

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId: sourceCardId,
			userId: params.userId,
			perfil: params.perfil,
		});

		const sourceColumn = await this.columnRepository.findById(
			sourceCard.columnId,
			params.companyId,
		);
		if (!sourceColumn?.boardId) {
			throw new AppError(404, "Coluna de origem não encontrada.");
		}
		if (sourceColumn.slug !== "concluido") {
			throw new AppError(
				400,
				"Só é possível recriar cards na coluna Concluído.",
			);
		}

		if (input.targetBoardId === sourceColumn.boardId) {
			throw new AppError(400, "Selecione um kanban diferente do atual.");
		}

		const targetBoard = await this.boardRepository.findById(
			input.targetBoardId,
			params.companyId,
		);
		if (!targetBoard) {
			throw new AppError(404, "Kanban de destino não encontrado.");
		}

		await assertCanAccessKanbanBoard(this.boardRepository, {
			boardId: input.targetBoardId,
			companyId: params.companyId,
			userId: params.userId,
			perfil: params.perfil,
		});

		const sourceBoard = await this.boardRepository.findById(
			sourceColumn.boardId,
			params.companyId,
		);

		await this.ensureBase.execute(params.companyId, input.targetBoardId);
		const targetColumns = await this.columnRepository.listByBoard(
			params.companyId,
			input.targetBoardId,
		);
		const targetColumn = targetColumns.find((c) => c.slug === "a_fazer");
		if (!targetColumn) {
			throw new AppError(500, "Coluna A fazer não encontrada no destino.");
		}

		const uniqueAssigneeIds = [...new Set(input.assigneeUserIds)];
		if (
			params.perfil === "cliente" &&
			!uniqueAssigneeIds.includes(params.userId)
		) {
			uniqueAssigneeIds.push(params.userId);
		}
		await validateAssignees(
			this.userRepository,
			uniqueAssigneeIds,
			params.companyId,
		);

		const position = await this.cardRepository.nextPosition(targetColumn.id);
		const newCard = await this.cardRepository.create({
			companyId: params.companyId,
			columnId: targetColumn.id,
			title: sourceCard.title,
			description: sourceCard.description,
			clientId: sourceCard.clientId,
			dueAt: null,
			position,
			createdBy: params.userId,
		});

		if (!newCard) {
			throw new AppError(500, "Falha ao recriar card.");
		}

		for (const assigneeId of uniqueAssigneeIds) {
			await this.cardRepository.insertAssignee(newCard.id, assigneeId);
		}

		const tagRows = await this.tagRepository.listTagsForCards([sourceCardId]);
		const tagNames = tagRows.map((t) => t.name);
		if (tagNames.length > 0) {
			await syncCardTags(this.tagRepository, {
				companyId: params.companyId,
				cardId: newCard.id,
				tagNames,
			});
		}

		if (input.copyChecklist) {
			const items = await this.checklistRepository.listByCard(sourceCardId);
			if (items.length > 0) {
				await this.checklistRepository.createMany(
					items.map((item) => ({
						cardId: newCard.id,
						title: item.title,
						position: item.position,
					})),
				);
			}
		}

		if (input.copyAttachments) {
			const attachments =
				await this.attachmentRepository.listWithContentByCard(sourceCardId);
			const toCopy = attachments.slice(0, MAX_ATTACHMENTS_PER_CARD);
			for (const attachment of toCopy) {
				await this.attachmentRepository.create({
					cardId: newCard.id,
					originalName: attachment.originalName,
					mimeType: attachment.mimeType,
					sizeBytes: attachment.sizeBytes,
					content: attachment.content,
					uploadedBy: attachment.uploadedBy ?? params.userId,
				});
			}
		}

		if (input.copyHistory) {
			await this.historyRepository.cloneToCard(sourceCardId, newCard.id);
		}

		const sourceBoardName = sourceBoard?.name ?? "kanban anterior";
		await this.historyRepository.create({
			cardId: newCard.id,
			userId: params.userId,
			eventType: "created",
			message: `Criado a partir do card "${sourceCard.title}" do kanban "${sourceBoardName}".`,
		});

		await this.historyRepository.create({
			cardId: sourceCardId,
			userId: params.userId,
			eventType: "recreated",
			message: `Recriado no kanban "${targetBoard.name}".`,
		});

		return {
			cardId: newCard.id,
			boardId: input.targetBoardId,
			columnId: targetColumn.id,
		};
	}
}
