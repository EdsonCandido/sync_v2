import {
	ITR_KANBAN_COLUMNS,
	ITR_KANBAN_COLUMN_SLUGS,
} from "@sync_v2/types";
import { KanbanBoardRepository } from "../repositories/KanbanBoardRepository";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";

export const ITR_BOARD_NAME = "ITR";

export class EnsureItrKanbanBoardService {
	constructor(
		private readonly boardRepository = new KanbanBoardRepository(),
		private readonly columnRepository = new KanbanColumnRepository(),
	) {}

	async execute(companyId: string, createdBy?: string | null) {
		let board = await this.boardRepository.findByName(
			companyId,
			ITR_BOARD_NAME,
		);
		if (!board) {
			board = await this.boardRepository.create({
				companyId,
				name: ITR_BOARD_NAME,
				isDefault: false,
				priority: 1,
				createdBy: createdBy ?? null,
			});
		}

		for (const col of ITR_KANBAN_COLUMNS) {
			const existing = await this.columnRepository.findBySlugAny(
				board.id,
				col.slug,
			);
			if (existing) {
				if (!existing.ativo) {
					await this.columnRepository.reactivate(existing.id, {
						name: col.name,
						position: col.position,
					});
				}
			} else {
				await this.columnRepository.create({
					companyId,
					boardId: board.id,
					name: col.name,
					slug: col.slug,
					position: col.position,
					isBase: true,
				});
			}
		}

		const columns = await this.columnRepository.listByBoard(
			companyId,
			board.id,
		);
		const aFazer = columns.find((c) => c.slug === ITR_KANBAN_COLUMN_SLUGS[0]);
		if (!aFazer) {
			throw new Error("Coluna ITR 'a_fazer' não encontrada.");
		}

		return { board, columns, aFazerColumn: aFazer };
	}
}
