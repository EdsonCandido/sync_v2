import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { companyModulePermissions } from "@sync_v2/db/schema/company-module-permissions";
import { userModulePermissions } from "@sync_v2/db/schema/module-permissions";
import { and, eq, inArray, sql } from "drizzle-orm";

export class CompanyModulePermissionRepository {
	async findActiveByCompanyId(companyId: string) {
		return db
			.select()
			.from(companyModulePermissions)
			.where(
				and(
					eq(companyModulePermissions.companyId, companyId),
					eq(companyModulePermissions.ativo, true),
				),
			);
	}

	async countActiveByCompanyId(companyId: string) {
		const [row] = await db
			.select({ value: sql<number>`count(*)::int` })
			.from(companyModulePermissions)
			.where(
				and(
					eq(companyModulePermissions.companyId, companyId),
					eq(companyModulePermissions.ativo, true),
				),
			);
		return row?.value ?? 0;
	}

	async findByCompanyAndModule(companyId: string, moduleKey: string) {
		const [row] = await db
			.select()
			.from(companyModulePermissions)
			.where(
				and(
					eq(companyModulePermissions.companyId, companyId),
					eq(companyModulePermissions.moduleKey, moduleKey),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async upsert(params: {
		companyId: string;
		moduleKey: string;
		canAccess: boolean;
		canLiberate: boolean;
		updatedBy?: string | null;
	}) {
		const existing = await this.findByCompanyAndModule(
			params.companyId,
			params.moduleKey,
		);

		if (existing) {
			const [row] = await db
				.update(companyModulePermissions)
				.set({
					canAccess: params.canAccess,
					canLiberate: params.canLiberate,
					ativo: true,
					updatedAt: new Date(),
					updatedBy: params.updatedBy ?? null,
				})
				.where(eq(companyModulePermissions.id, existing.id))
				.returning();
			return row;
		}

		const [row] = await db
			.insert(companyModulePermissions)
			.values({
				companyId: params.companyId,
				moduleKey: params.moduleKey,
				canAccess: params.canAccess,
				canLiberate: params.canLiberate,
				createdBy: params.updatedBy ?? null,
				updatedBy: params.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async revokeModuleForCompanyClientes(params: {
		companyId: string;
		moduleKey: string;
		updatedBy?: string | null;
	}) {
		const clienteUsers = await db
			.select({ id: user.id })
			.from(user)
			.where(
				and(
					eq(user.companyId, params.companyId),
					eq(user.perfil, "cliente"),
					eq(user.ativo, true),
				),
			);

		if (clienteUsers.length === 0) {
			return 0;
		}

		const userIds = clienteUsers.map((u) => u.id);

		const result = await db
			.update(userModulePermissions)
			.set({
				canRead: false,
				canEdit: false,
				updatedAt: new Date(),
				updatedBy: params.updatedBy ?? null,
			})
			.where(
				and(
					inArray(userModulePermissions.userId, userIds),
					eq(userModulePermissions.moduleKey, params.moduleKey),
					eq(userModulePermissions.ativo, true),
				),
			)
			.returning({ id: userModulePermissions.id });

		return result.length;
	}
}
