import type { ModuleKey } from "@sync_v2/types";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";
import { AppError } from "../utils/AppError";
import { GetCompanyModulesService } from "./GetCompanyModulesService";

export class ListCompanyUserPermissionsService {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
	) {}

	async execute(companyId: string) {
		if (!companyId) {
			throw new AppError(403, "Empresa não vinculada.");
		}

		const liberatable =
			await this.getCompanyModulesService.liberatableKeys(companyId);

		const users =
			await this.modulePermissionRepository.listClienteUsersByCompany(
				companyId,
			);

		const result = [];
		for (const u of users) {
			const rows = await this.modulePermissionRepository.findActiveByUserId(
				u.id,
			);
			const byKey = new Map(rows.map((r) => [r.moduleKey, r]));

			result.push({
				userId: u.id,
				name: u.name,
				email: u.email,
				modules: liberatable.map((moduleKey) => {
					const row = byKey.get(moduleKey);
					return {
						moduleKey: moduleKey as ModuleKey,
						canRead: Boolean(row?.canRead || row?.canEdit),
						canEdit: Boolean(row?.canEdit),
					};
				}),
			});
		}

		return {
			liberatableModules: liberatable,
			users: result,
		};
	}
}
