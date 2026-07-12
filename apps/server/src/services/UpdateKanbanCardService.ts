import type { UpdateKanbanCardInput } from "@sync_v2/contracts";
import { ClientRepository } from "../repositories/ClientRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { KanbanTagRepository } from "../repositories/KanbanTagRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { syncAssignees, validateAssignees } from "./CreateKanbanCardService";
import { assertCanAccessKanbanCard } from "./KanbanCardAccessRules";
import { syncCardTags } from "./SyncKanbanCardTagsService";

export class UpdateKanbanCardService {
	constructor(
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
		private readonly clientRepository = new ClientRepository(),
		private readonly userRepository = new UserRepository(),
		private readonly tagRepository = new KanbanTagRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateKanbanCardInput,
		params: { companyId: string; userId: string; perfil: string },
	) {
		const card = await this.cardRepository.findById(id, params.companyId);
		if (!card) {
			throw new AppError(404, "Card não encontrado.");
		}

		await assertCanAccessKanbanCard(this.cardRepository, {
			cardId: id,
			userId: params.userId,
			perfil: params.perfil,
		});

		if (input.clientId) {
			const client = await this.clientRepository.findById(
				input.clientId,
				params.companyId,
			);
			if (!client) {
				throw new AppError(400, "Cliente inválido.");
			}
		}

		if (input.assigneeUserIds) {
			await validateAssignees(
				this.userRepository,
				input.assigneeUserIds,
				params.companyId,
			);
		}

		const updated = await this.cardRepository.update(id, params.companyId, {
			title: input.title?.trim(),
			description:
				input.description !== undefined
					? input.description?.trim() || null
					: undefined,
			clientId: input.clientId,
			dueAt: input.dueAt !== undefined ? input.dueAt : undefined,
			updatedBy: params.userId,
		});

		if (!updated) {
			throw new AppError(404, "Card não encontrado.");
		}

		if (input.assigneeUserIds) {
			await syncAssignees(this.cardRepository, id, input.assigneeUserIds);
			await this.historyRepository.create({
				cardId: id,
				userId: params.userId,
				eventType: "assignees",
				message: "Responsáveis atualizados.",
			});
		}

		if (input.tagNames !== undefined) {
			await syncCardTags(this.tagRepository, {
				companyId: params.companyId,
				cardId: id,
				tagNames: input.tagNames,
			});
			await this.historyRepository.create({
				cardId: id,
				userId: params.userId,
				eventType: "tags",
				message: "Tags atualizadas.",
			});
		}

		await this.historyRepository.create({
			cardId: id,
			userId: params.userId,
			eventType: "updated",
			message: "Card atualizado.",
		});

		return updated;
	}
}
