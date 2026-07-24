import type { CreateCompanyInput } from "@sync_v2/contracts";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { PlanRepository } from "../repositories/PlanRepository";
import { AppError } from "../utils/AppError";
import { SeedCompanyFinanceiroDefaultsService } from "./SeedCompanyFinanceiroDefaultsService";

export class CreateCompanyService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly planRepository = new PlanRepository(),
		private readonly seedFinanceiroDefaults = new SeedCompanyFinanceiroDefaultsService(),
	) {}

	async execute(input: CreateCompanyInput, userId: string) {
		const plan = await this.planRepository.findById(input.planId);
		if (!plan || !plan.ativo) {
			throw new AppError(400, "Plano inválido ou inativo.");
		}

		const byDoc = await this.companyRepository.findByDocument(
			normalizeDocument(input.document),
		);
		if (byDoc) {
			throw new AppError(409, "CNPJ já cadastrado.");
		}

		const byEmail = await this.companyRepository.findByEmail(
			input.email.toLowerCase(),
		);
		if (byEmail) {
			throw new AppError(409, "Email já cadastrado.");
		}

		const company = await this.companyRepository.create({
			...input,
			document: normalizeDocument(input.document),
			email: input.email.toLowerCase(),
			state: input.state.toUpperCase(),
			planExpiresAt: input.planExpiresAt ?? plan.endDate,
			createdBy: userId,
			updatedBy: userId,
		});

		if (!company) {
			throw new AppError(500, "Falha ao criar empresa.");
		}

		await this.seedFinanceiroDefaults.execute({
			companyId: company.id,
			userId,
		});

		return company;
	}
}

function normalizeDocument(document: string) {
	return document.replace(/\D/g, "");
}
