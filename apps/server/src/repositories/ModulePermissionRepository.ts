import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { userModulePermissions } from "@sync_v2/db/schema/module-permissions";
import { and, eq } from "drizzle-orm";

export class ModulePermissionRepository {
	async findActiveByUserId(userId: string) {
		return db
			.select()
			.from(userModulePermissions)
			.where(
				and(
					eq(userModulePermissions.userId, userId),
					eq(userModulePermissions.ativo, true),
				),
			);
	}

	async findByUserAndModule(userId: string, moduleKey: string) {
		const [row] = await db
			.select()
			.from(userModulePermissions)
			.where(
				and(
					eq(userModulePermissions.userId, userId),
					eq(userModulePermissions.moduleKey, moduleKey),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async listClienteUsersByCompany(companyId: string) {
		return db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
			})
			.from(user)
			.where(
				and(
					eq(user.companyId, companyId),
					eq(user.perfil, "cliente"),
					eq(user.ativo, true),
				),
			);
	}

	async findUserInCompany(userId: string, companyId: string) {
		const [row] = await db
			.select()
			.from(user)
			.where(
				and(
					eq(user.id, userId),
					eq(user.companyId, companyId),
					eq(user.perfil, "cliente"),
					eq(user.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async upsert(params: {
		userId: string;
		moduleKey: string;
		canRead: boolean;
		canEdit: boolean;
		updatedBy?: string | null;
	}) {
		const existing = await this.findByUserAndModule(
			params.userId,
			params.moduleKey,
		);

		if (existing) {
			const [row] = await db
				.update(userModulePermissions)
				.set({
					canRead: params.canRead,
					canEdit: params.canEdit,
					ativo: true,
					updatedAt: new Date(),
					updatedBy: params.updatedBy ?? null,
				})
				.where(eq(userModulePermissions.id, existing.id))
				.returning();
			return row;
		}

		const [row] = await db
			.insert(userModulePermissions)
			.values({
				userId: params.userId,
				moduleKey: params.moduleKey,
				canRead: params.canRead,
				canEdit: params.canEdit,
				createdBy: params.updatedBy ?? null,
				updatedBy: params.updatedBy ?? null,
			})
			.returning();
		return row;
	}
}
