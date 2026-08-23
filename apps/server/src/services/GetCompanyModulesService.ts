import { APP_MODULES, type ModuleKey } from "@sync_v2/types";
import { CompanyModulePermissionRepository } from "../repositories/CompanyModulePermissionRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { AppError } from "../utils/AppError";

export type EffectiveCompanyModule = {
	moduleKey: ModuleKey;
	canAccess: boolean;
	canLiberate: boolean;
};

/**
 * Resolve módulos efetivos da empresa.
 * Sem rows ativas = legado (todos APP_MODULES com access + liberate).
 */
export class GetCompanyModulesService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly companyModulePermissionRepository = new CompanyModulePermissionRepository(),
	) {}

	async execute(companyId: string): Promise<{
		modules: EffectiveCompanyModule[];
	}> {
		const company = await this.companyRepository.findById(companyId);
		if (!company) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		const rows =
			await this.companyModulePermissionRepository.findActiveByCompanyId(
				companyId,
			);

		if (rows.length === 0) {
			return {
				modules: APP_MODULES.map((moduleKey) => ({
					moduleKey,
					canAccess: true,
					canLiberate: true,
				})),
			};
		}

		const byKey = new Map(rows.map((r) => [r.moduleKey, r]));

		return {
			modules: APP_MODULES.map((moduleKey) => {
				const row = byKey.get(moduleKey);
				const canAccess = Boolean(row?.canAccess);
				const canLiberate = canAccess && Boolean(row?.canLiberate);
				return {
					moduleKey,
					canAccess,
					canLiberate,
				};
			}),
		};
	}

	async canAccess(companyId: string, moduleKey: ModuleKey): Promise<boolean> {
		const { modules } = await this.execute(companyId);
		return Boolean(modules.find((m) => m.moduleKey === moduleKey)?.canAccess);
	}

	async liberatableKeys(companyId: string): Promise<ModuleKey[]> {
		const { modules } = await this.execute(companyId);
		return modules.filter((m) => m.canLiberate).map((m) => m.moduleKey);
	}
}
