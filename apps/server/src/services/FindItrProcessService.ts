import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";

export class FindItrProcessService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const row = await this.processRepository.findById(id, companyId);
		if (!row) {
			throw new AppError(404, "Processo ITR não encontrado.");
		}
		const files = await this.fileRepository.listByProcess(row.process.id);
		return {
			id: row.process.id,
			companyId: row.process.companyId,
			clientId: row.process.clientId,
			clientName: row.clientName,
			clientDocument: row.clientDocument,
			kanbanCardId: row.process.kanbanCardId,
			financialEntryId: row.process.financialEntryId,
			valor: row.process.valor,
			observacoes: row.process.observacoes,
			columnSlug: row.columnSlug,
			columnName: row.columnName,
			files,
			ativo: row.process.ativo,
			createdAt: row.process.createdAt,
			updatedAt: row.process.updatedAt,
		};
	}
}
