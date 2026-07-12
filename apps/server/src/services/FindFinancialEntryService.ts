import {
	deriveStatus,
	FinancialEntryRepository,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";

export class FindFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(id: string, companyId: string) {
		const entry = await this.entryRepository.findById(id, companyId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		const [payments, history, attachments] = await Promise.all([
			this.entryRepository.listPayments(id, companyId),
			this.entryRepository.listHistory(id, companyId),
			this.entryRepository.listAttachmentsMeta(id),
		]);
		return {
			...entry,
			status: deriveStatus(entry.status, entry.dataVencimento),
			payments: payments.map((p) => ({
				id: p.id,
				valor: p.valor,
				juros: p.juros,
				multa: p.multa,
				desconto: p.desconto,
				dataPagamento: p.dataPagamento,
				bankAccountId: p.bankAccountId,
				observacoes: p.observacoes,
				estornado: p.estornado,
				createdAt: p.createdAt,
			})),
			history: history.map((h) => ({
				id: h.id,
				action: h.action,
				userId: h.userId,
				ip: h.ip,
				payload: h.payload,
				createdAt: h.createdAt,
			})),
			attachments,
		};
	}
}
