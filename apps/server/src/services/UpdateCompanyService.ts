import type { UpdateCompanyInput } from "@sync_v2/contracts";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";
import { withRemainingDays } from "../utils/planRemainingDays";

export class UpdateCompanyService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly planRepository = new PlanRepository(),
	) {}

	async execute(id: string, input: UpdateCompanyInput, userId: string) {
		const existing = await this.companyRepository.findById(id);
		if (!existing) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		let planExpiresAt: Date | undefined;

		if (input.planId) {
			const plan = await this.planRepository.findById(input.planId);
			if (!plan || !plan.ativo) {
				throw new AppError(400, "Plano inválido ou inativo.");
			}
			if (input.planId !== existing.planId) {
				planExpiresAt = new Date();
				planExpiresAt.setDate(planExpiresAt.getDate() + plan.durationDays);
			}
		}

		if (input.document) {
			const doc = normalizeDocument(input.document);
			const byDoc = await this.companyRepository.findByDocument(doc, id);
			if (byDoc) {
				throw new AppError(409, "CNPJ já cadastrado.");
			}
			input.document = doc;
		}

		if (input.email) {
			const email = input.email.toLowerCase();
			const byEmail = await this.companyRepository.findByEmail(email, id);
			if (byEmail) {
				throw new AppError(409, "Email já cadastrado.");
			}
			input.email = email;
		}

		if (input.state) {
			input.state = input.state.toUpperCase();
		}

		const payload = Object.fromEntries(
			Object.entries({
				...input,
				planExpiresAt,
				updatedBy: userId,
			}).filter(([, value]) => value !== undefined),
		) as UpdateCompanyInput & {
			planExpiresAt?: Date;
			updatedBy?: string | null;
		};

		const updated = await this.companyRepository.update(id, payload);

		if (!updated) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		return withRemainingDays(updated);
	}
}

function normalizeDocument(document: string) {
	return document.replace(/\D/g, "");
}
