import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteItrProcessService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(id: string, params: { companyId: string; userId: string }) {
		const existing = await this.processRepository.findById(
			id,
			params.companyId,
		);
		if (!existing) {
			throw new AppError(404, "Processo ITR não encontrado.");
		}

		await this.fileRepository.softDeleteByProcess(id);
		const deleted = await this.processRepository.softDelete(
			id,
			params.companyId,
			params.userId,
		);
		if (!deleted) {
			throw new AppError(500, "Falha ao excluir processo ITR.");
		}
		return { ok: true };
	}
}
