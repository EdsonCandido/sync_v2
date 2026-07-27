import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteItrFileService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(
		processId: string,
		fileId: string,
		params: { companyId: string },
	) {
		const process = await this.processRepository.findById(
			processId,
			params.companyId,
		);
		if (!process) {
			throw new AppError(404, "Processo ITR não encontrado.");
		}

		const existing = await this.fileRepository.findById(fileId);
		if (!existing || existing.processId !== processId) {
			throw new AppError(404, "Arquivo não encontrado.");
		}

		const deleted = await this.fileRepository.softDelete(fileId, processId);
		if (!deleted) {
			throw new AppError(404, "Arquivo não encontrado.");
		}
		return { ok: true };
	}
}
