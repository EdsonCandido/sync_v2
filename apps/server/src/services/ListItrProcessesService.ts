import type { ListItrProcessesQuery } from "@sync_v2/contracts";
import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";

export class ListItrProcessesService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(query: ListItrProcessesQuery, companyId: string) {
		const result = await this.processRepository.list({
			companyId,
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
		});

		const items = await Promise.all(
			result.items.map(async (row) => {
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
			}),
		);

		return {
			items,
			total: result.total,
			page: result.page,
			pageSize: result.pageSize,
		};
	}
}
