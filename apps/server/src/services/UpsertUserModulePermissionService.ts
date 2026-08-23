import type { UpsertUserModulePermissionsInput } from "@sync_v2/contracts";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";
import { AppError } from "../utils/AppError";
import { GetCompanyModulesService } from "./GetCompanyModulesService";

export class UpsertUserModulePermissionService {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
	) {}

	async execute(params: {
		targetUserId: string;
		companyId: string;
		input: UpsertUserModulePermissionsInput;
		actorUserId: string;
	}) {
		const target = await this.modulePermissionRepository.findUserInCompany(
			params.targetUserId,
			params.companyId,
		);
		if (!target) {
			throw new AppError(404, "Usuário não encontrado nesta empresa.");
		}

		const liberatable =
			await this.getCompanyModulesService.liberatableKeys(params.companyId);
		const liberatableSet = new Set(liberatable);

		for (const item of params.input.modules) {
			if (!liberatableSet.has(item.moduleKey)) {
				throw new AppError(
					400,
					`Módulo não liberável para esta empresa: ${item.moduleKey}`,
				);
			}

			const canEdit = item.canEdit;
			const canRead = canEdit || item.canRead;

			await this.modulePermissionRepository.upsert({
				userId: params.targetUserId,
				moduleKey: item.moduleKey,
				canRead,
				canEdit,
				updatedBy: params.actorUserId,
			});
		}

		const rows = await this.modulePermissionRepository.findActiveByUserId(
			params.targetUserId,
		);
		const byKey = new Map(rows.map((r) => [r.moduleKey, r]));

		return {
			userId: target.id,
			name: target.name,
			email: target.email,
			modules: liberatable.map((moduleKey) => {
				const row = byKey.get(moduleKey);
				return {
					moduleKey,
					canRead: Boolean(row?.canRead || row?.canEdit),
					canEdit: Boolean(row?.canEdit),
				};
			}),
		};
	}
}
