import type { CreateKanbanCardInput } from "@sync_v2/contracts";
import { ClientRepository } from "../repositories/ClientRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { KanbanTagRepository } from "../repositories/KanbanTagRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";
import { syncCardTags } from "./SyncKanbanCardTagsService";

export class CreateKanbanCardService {
	constructor(
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
		private readonly columnRepository = new KanbanColumnRepository(),
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
		private readonly clientRepository = new ClientRepository(),
		private readonly userRepository = new UserRepository(),
		private readonly tagRepository = new KanbanTagRepository(),
	) {}

	async execute(
		input: CreateKanbanCardInput,
		params: { companyId: string; userId: string; perfil?: string },
	) {
		await this.ensureBase.execute(params.companyId);

		const column = await this.columnRepository.findById(
			input.columnId,
			params.companyId,
		);
		if (!column) {
			throw new AppError(404, "Coluna não encontrada.");
		}

		if (input.clientId) {
			const client = await this.clientRepository.findById(
				input.clientId,
				params.companyId,
			);
			if (!client) {
				throw new AppError(400, "Cliente inválido.");
			}
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

		const position = await this.cardRepository.nextPosition(input.columnId);
		const card = await this.cardRepository.create({
			companyId: params.companyId,
			columnId: input.columnId,
			title: input.title.trim(),
			description: input.description?.trim() || null,
			clientId: input.clientId ?? null,
			dueAt: input.dueAt ?? null,
			position,
			createdBy: params.userId,
		});

		if (!card) {
			throw new AppError(500, "Falha ao criar card.");
		}

		for (const assigneeId of uniqueAssigneeIds) {
			await this.cardRepository.insertAssignee(card.id, assigneeId);
		}

		if (input.tagNames?.length) {
			await syncCardTags(this.tagRepository, {
				companyId: params.companyId,
				cardId: card.id,
				tagNames: input.tagNames,
			});
		}

		await this.historyRepository.create({
			cardId: card.id,
			userId: params.userId,
			eventType: "created",
			message: `Card "${card.title}" criado.`,
		});

		return card;
	}
}

export async function validateAssignees(
	userRepository: UserRepository,
	assigneeUserIds: string[],
	companyId: string,
) {
	if (assigneeUserIds.length === 0) {
		throw new AppError(400, "Informe ao menos um responsável.");
	}
	for (const userId of assigneeUserIds) {
		const u = await userRepository.findById(userId);
		if (!u || !u.ativo || u.companyId !== companyId) {
			throw new AppError(
				400,
				"Responsável inválido: somente usuários ativos da empresa.",
			);
		}
	}
}

export async function syncAssignees(
	cardRepository: KanbanCardRepository,
	cardId: string,
	assigneeUserIds: string[],
) {
	const uniqueIds = [...new Set(assigneeUserIds)];
	await cardRepository.softDeleteAssigneesNotIn(cardId, uniqueIds);
	for (const userId of uniqueIds) {
		const existing = await cardRepository.findAssigneeRow(cardId, userId);
		if (existing) {
			if (!existing.ativo) {
				await cardRepository.activateAssignee(existing.id);
			}
		} else {
			await cardRepository.insertAssignee(cardId, userId);
		}
	}
}
