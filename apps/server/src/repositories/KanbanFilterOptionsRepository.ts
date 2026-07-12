import { db } from "@sync_v2/db";
import { user } from "@sync_v2/db/schema/auth";
import { clients } from "@sync_v2/db/schema/clients";
import { kanbanTags } from "@sync_v2/db/schema/kanban";
import { and, asc, eq } from "drizzle-orm";

export class KanbanFilterOptionsRepository {
	async listAssignees(companyId: string) {
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
					eq(user.ativo, true),
					eq(user.blocked, false),
				),
			)
			.orderBy(asc(user.name));
	}

	async listClients(companyId: string) {
		return db
			.select({
				id: clients.id,
				name: clients.name,
			})
			.from(clients)
			.where(and(eq(clients.companyId, companyId), eq(clients.ativo, true)))
			.orderBy(asc(clients.name));
	}

	async listTags(companyId: string) {
		return db
			.select({
				id: kanbanTags.id,
				name: kanbanTags.name,
				slug: kanbanTags.slug,
				color: kanbanTags.color,
			})
			.from(kanbanTags)
			.where(
				and(eq(kanbanTags.companyId, companyId), eq(kanbanTags.ativo, true)),
			)
			.orderBy(asc(kanbanTags.name));
	}
}
