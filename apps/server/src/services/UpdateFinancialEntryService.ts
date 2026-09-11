import type { UpdateFinancialEntryInput } from "@sync_v2/contracts";
import {
	calcValorAberto,
	FinancialEntryRepository,
} from "../repositories/FinancialEntryRepository";
import { AppError } from "../utils/AppError";
import { addMonths } from "../utils/addMonths";

export class UpdateFinancialEntryService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateFinancialEntryInput,
		params: { companyId: string; userId: string; ip?: string | null },
	) {
		const entry = await this.entryRepository.findById(id, params.companyId);
		if (!entry) throw new AppError(404, "Lançamento não encontrado.");
		if (entry.status === "cancelado" || entry.status === "pago") {
			throw new AppError(400, "Lançamento não pode ser alterado.");
		}

		const { applyToOpenInstallments = false, ...fields } = input;

		const desconto = fields.desconto ?? entry.desconto;
		const acrescimo = fields.acrescimo ?? entry.acrescimo;
		const juros = fields.juros ?? entry.juros;
		const multa = fields.multa ?? entry.multa;
		const valorAberto = calcValorAberto(
			entry.valorOriginal,
			desconto,
			acrescimo,
			juros,
			multa,
			entry.valorPago,
		);

		const updated = await this.entryRepository.update(id, params.companyId, {
			...fields,
			desconto,
			acrescimo,
			juros,
			multa,
			valorAberto,
			updatedBy: params.userId,
		});
		await this.entryRepository.addHistory({
			companyId: params.companyId,
			entryId: id,
			action: "updated",
			userId: params.userId,
			ip: params.ip,
			payload: input,
		});

		if (
			applyToOpenInstallments &&
			entry.installmentGroupId &&
			entry.installmentNumber != null
		) {
			const openSiblings = await this.entryRepository.listOpenByGroup(
				params.companyId,
				entry.installmentGroupId,
			);
			const baseEmissao = fields.dataEmissao ?? entry.dataEmissao;
			const baseVencimento = fields.dataVencimento ?? entry.dataVencimento;
			const editedNumber = entry.installmentNumber;

			const shared: {
				originLabel?: string | null;
				clientId?: string | null;
				supplierId?: string | null;
				categoryId?: string | null;
				costCenterId?: string | null;
				bankAccountId?: string | null;
				documento?: string | null;
				observacoes?: string | null;
			} = {};
			if (fields.originLabel !== undefined)
				shared.originLabel = fields.originLabel;
			if (fields.clientId !== undefined) shared.clientId = fields.clientId;
			if (fields.supplierId !== undefined)
				shared.supplierId = fields.supplierId;
			if (fields.categoryId !== undefined)
				shared.categoryId = fields.categoryId;
			if (fields.costCenterId !== undefined)
				shared.costCenterId = fields.costCenterId;
			if (fields.bankAccountId !== undefined)
				shared.bankAccountId = fields.bankAccountId;
			if (fields.documento !== undefined) shared.documento = fields.documento;
			if (fields.observacoes !== undefined)
				shared.observacoes = fields.observacoes;

			for (const sibling of openSiblings) {
				if (sibling.id === id) continue;
				const monthDelta =
					(sibling.installmentNumber ?? editedNumber) - editedNumber;
				const siblingPayload = {
					...shared,
					dataEmissao: baseEmissao,
					dataVencimento: addMonths(baseVencimento, monthDelta),
					updatedBy: params.userId,
				};
				await this.entryRepository.update(
					sibling.id,
					params.companyId,
					siblingPayload,
				);
				await this.entryRepository.addHistory({
					companyId: params.companyId,
					entryId: sibling.id,
					action: "updated",
					userId: params.userId,
					ip: params.ip,
					payload: {
						...siblingPayload,
						applyToOpenInstallments: true,
						sourceEntryId: id,
					},
				});
			}
		}

		return updated;
	}
}
