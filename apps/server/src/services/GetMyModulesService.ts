import { APP_MODULES, type ModuleKey } from "@sync_v2/types";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";

export class GetMyModulesService {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
	) {}

	async execute(params: {
		userId: string;
		perfil?: string | null;
		companyId?: string | null;
	}) {
		if (params.perfil === "super") {
			return {
				modules: [
					{
						moduleKey: "usuarios" as ModuleKey,
						canRead: true,
						canEdit: true,
					},
				],
			};
		}

		if (params.perfil === "admin_empresa" && params.companyId) {
			return {
				modules: APP_MODULES.map((moduleKey) => ({
					moduleKey,
					canRead: true,
					canEdit: true,
				})),
			};
		}

		if (params.perfil !== "cliente" || !params.companyId) {
			return { modules: [] };
		}

		const rows = await this.modulePermissionRepository.findActiveByUserId(
			params.userId,
		);

		const byKey = new Map(
			rows.map((row) => [
				row.moduleKey,
				{
					moduleKey: row.moduleKey as ModuleKey,
					canRead: row.canRead || row.canEdit,
					canEdit: row.canEdit,
				},
			]),
		);

		return {
			modules: APP_MODULES.flatMap((key) => {
				const grant = byKey.get(key);
				if (!grant || !(grant.canRead || grant.canEdit)) return [];
				return [grant];
			}),
		};
	}
}
