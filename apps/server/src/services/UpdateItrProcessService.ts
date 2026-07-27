import type { UpdateItrProcessInput } from "@sync_v2/contracts";
import { ItrProcessRepository } from "../repositories/ItrProcessRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { AppError } from "../utils/AppError";
import { FindItrProcessService } from "./FindItrProcessService";

export class UpdateItrProcessService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly findItrProcess = new FindItrProcessService(),
	) {}

	async execute(
		id: string,
		input: UpdateItrProcessInput,
		params: { companyId: string; userId: string },
	) {
		const existing = await this.processRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Processo ITR não encontrado.");
		}

		const observacoes =
			input.observacoes !== undefined
				? input.observacoes?.trim() || null
				: existing.process.observacoes;

		const updated = await this.processRepository.update(id, params.companyId, {
			observacoes,
			updatedBy: params.userId,
		});
		if (!updated) {
			throw new AppError(500, "Falha ao atualizar processo ITR.");
		}

		await this.cardRepository.update(
			existing.process.kanbanCardId,
			params.companyId,
			{
				description: observacoes,
				updatedBy: params.userId,
			},
		);

		return this.findItrProcess.execute(id, params.companyId);
	}
}
