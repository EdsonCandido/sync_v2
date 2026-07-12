import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteKanbanColumnService {
	constructor(
		private readonly columnRepository = new KanbanColumnRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const column = await this.columnRepository.findById(id, companyId);
		if (!column) {
			throw new AppError(404, "Coluna não encontrada.");
		}
		if (column.isBase) {
			throw new AppError(400, "Colunas base não podem ser excluídas.");
		}

		const deleted = await this.columnRepository.softDelete(id, companyId);
		if (!deleted) {
			throw new AppError(400, "Não foi possível excluir a coluna.");
		}
		return deleted;
	}
}
