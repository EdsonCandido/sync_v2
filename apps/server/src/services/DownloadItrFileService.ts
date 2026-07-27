import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";

export class DownloadItrFileService {
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

		const file = await this.fileRepository.findById(fileId);
		if (!file || file.processId !== processId) {
			throw new AppError(404, "Arquivo não encontrado.");
		}

		return {
			originalName: file.originalName,
			mimeType: file.mimeType,
			content: file.content,
		};
	}
}
