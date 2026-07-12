import type { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { AppError } from "../utils/AppError";

export async function assertCanAccessKanbanCard(
	cardRepository: KanbanCardRepository,
	params: { cardId: string; userId: string; perfil: string },
) {
	if (params.perfil === "admin_empresa") {
		return;
	}
	if (params.perfil !== "cliente") {
		throw new AppError(403, "Sem permissão para este card.");
	}
	const isAssignee = await cardRepository.isUserAssignee(
		params.cardId,
		params.userId,
	);
	if (!isAssignee) {
		throw new AppError(403, "Você só pode acessar cards em que é responsável.");
	}
}
