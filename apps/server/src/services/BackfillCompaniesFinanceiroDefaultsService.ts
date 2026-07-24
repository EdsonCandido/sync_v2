import { CompanyRepository } from "../repositories/CompanyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { SeedCompanyFinanceiroDefaultsService } from "./SeedCompanyFinanceiroDefaultsService";

export type BackfillCompaniesFinanceiroDefaultsResult = {
	totalCompanies: number;
	processed: number;
	failed: Array<{ companyId: string; tradeName: string; error: string }>;
};

export class BackfillCompaniesFinanceiroDefaultsService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly userRepository = new UserRepository(),
		private readonly seedFinanceiroDefaults = new SeedCompanyFinanceiroDefaultsService(),
	) {}

	async execute(params?: { userId?: string }) {
		const actorUserId = params?.userId ?? (await this.resolveActorUserId());
		const companies = await this.companyRepository.listAllActive();

		const result: BackfillCompaniesFinanceiroDefaultsResult = {
			totalCompanies: companies.length,
			processed: 0,
			failed: [],
		};

		for (const company of companies) {
			try {
				await this.seedFinanceiroDefaults.execute({
					companyId: company.id,
					userId: actorUserId,
				});
				result.processed += 1;
			} catch (error) {
				result.failed.push({
					companyId: company.id,
					tradeName: company.tradeName,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return result;
	}

	private async resolveActorUserId() {
		const superUser = await this.userRepository.findFirstActiveByPerfil("super");
		if (!superUser) {
			throw new AppError(
				500,
				"Nenhum usuário super ativo encontrado para auditoria do backfill.",
			);
		}
		return superUser.id;
	}
}
