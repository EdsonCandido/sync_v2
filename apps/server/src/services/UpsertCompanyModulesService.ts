import type { UpsertCompanyModulesInput } from "@sync_v2/contracts";
import { APP_MODULES } from "@sync_v2/types";
import { CompanyModulePermissionRepository } from "../repositories/CompanyModulePermissionRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { AppError } from "../utils/AppError";
import { GetCompanyModulesService } from "./GetCompanyModulesService";

export class UpsertCompanyModulesService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly companyModulePermissionRepository = new CompanyModulePermissionRepository(),
		private readonly getCompanyModulesService = new GetCompanyModulesService(),
	) {}

	async execute(params: {
		companyId: string;
		input: UpsertCompanyModulesInput;
		actorUserId: string;
	}) {
		const company = await this.companyRepository.findById(params.companyId);
		if (!company) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		const byKey = new Map(
			params.input.modules.map((item) => [item.moduleKey, item]),
		);

		for (const moduleKey of APP_MODULES) {
			if (!byKey.has(moduleKey)) {
				throw new AppError(
					400,
					`Módulo obrigatório ausente no payload: ${moduleKey}`,
				);
			}
		}

		const previous = await this.getCompanyModulesService.execute(
			params.companyId,
		);
		const previousAccess = new Map(
			previous.modules.map((m) => [m.moduleKey, m.canAccess]),
		);

		for (const moduleKey of APP_MODULES) {
			const item = byKey.get(moduleKey)!;
			const canAccess = item.canAccess;
			const canLiberate = canAccess && item.canLiberate;

			await this.companyModulePermissionRepository.upsert({
				companyId: params.companyId,
				moduleKey,
				canAccess,
				canLiberate,
				updatedBy: params.actorUserId,
			});

			const hadAccess = previousAccess.get(moduleKey) ?? true;
			if (hadAccess && !canAccess) {
				await this.companyModulePermissionRepository.revokeModuleForCompanyClientes(
					{
						companyId: params.companyId,
						moduleKey,
						updatedBy: params.actorUserId,
					},
				);
			}
		}

		return this.getCompanyModulesService.execute(params.companyId);
	}
}
