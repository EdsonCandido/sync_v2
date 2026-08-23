import { APP_MODULES, type ModuleKey } from "@sync_v2/types";
import { ModulePermissionRepository } from "../repositories/ModulePermissionRepository";
import { GetCompanyModulesService } from "./GetCompanyModulesService";

export class GetMyModulesService {
	constructor(
		private readonly modulePermissionRepository = new ModulePermissionRepository(),
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
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
			const { modules } = await this.getCompanyModulesService.execute(
				params.companyId,
			);
			return {
				modules: modules
					.filter((m) => m.canAccess)
					.map((m) => ({
						moduleKey: m.moduleKey,
						canRead: true,
						canEdit: true,
					})),
			};
		}

		if (params.perfil !== "cliente" || !params.companyId) {
			return { modules: [] };
		}

		const { modules: companyModules } =
			await this.getCompanyModulesService.execute(params.companyId);
		const companyAccess = new Set(
			companyModules.filter((m) => m.canAccess).map((m) => m.moduleKey),
		);

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
				if (!companyAccess.has(key)) return [];
				const grant = byKey.get(key);
				if (!grant || !(grant.canRead || grant.canEdit)) return [];
				return [grant];
			}),
		};
	}
}
