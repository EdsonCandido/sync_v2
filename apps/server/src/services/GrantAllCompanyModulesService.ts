import { APP_MODULES } from "@sync_v2/types";
import { CompanyModulePermissionRepository } from "../repositories/CompanyModulePermissionRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";

export type GrantAllCompanyModulesResult = {
	totalCompanies: number;
	processed: number;
	failed: Array<{ companyId: string; tradeName: string; error: string }>;
};

export class GrantAllCompanyModulesService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly companyModulePermissionRepository = new CompanyModulePermissionRepository(),
		private readonly userRepository = new UserRepository(),
	) {}

	async execute(params?: { userId?: string }) {
		const actorUserId = params?.userId ?? (await this.resolveActorUserId());
		const companies = await this.companyRepository.listAllActive();

		const result: GrantAllCompanyModulesResult = {
			totalCompanies: companies.length,
			processed: 0,
			failed: [],
		};

		for (const company of companies) {
			try {
				for (const moduleKey of APP_MODULES) {
					await this.companyModulePermissionRepository.upsert({
						companyId: company.id,
						moduleKey,
						canAccess: true,
						canLiberate: true,
						updatedBy: actorUserId,
					});
				}
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
		const superUser =
			await this.userRepository.findFirstActiveByPerfil("super");
		if (!superUser) {
			throw new AppError(
				500,
				"Nenhum usuário super ativo encontrado para auditoria.",
			);
		}
		return superUser.id;
	}
}
