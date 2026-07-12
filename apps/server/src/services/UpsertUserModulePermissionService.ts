import type { UpsertUserModulePermissionsInput } from "@sync_v2/contracts";
import { APP_MODULES } from "@sync_v2/types";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";
import { AppError } from "../utils/AppError";

export class UpsertUserModulePermissionService {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
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

		const allowed = new Set(APP_MODULES);
		for (const item of params.input.modules) {
			if (!allowed.has(item.moduleKey)) {
				throw new AppError(400, `Módulo inválido: ${item.moduleKey}`);
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
			modules: APP_MODULES.map((moduleKey) => {
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
