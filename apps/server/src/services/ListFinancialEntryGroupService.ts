import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ListFinancialEntryGroupService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(groupId: string, companyId: string) {
		if (!UUID_RE.test(groupId)) {
			throw new AppError(400, "Grupo de parcelas inválido.");
		}
		const items = await this.entryRepository.listByGroup(companyId, groupId);
		if (items.length === 0) {
			throw new AppError(404, "Grupo de parcelas não encontrado.");
		}
		return { items };
	}
}
