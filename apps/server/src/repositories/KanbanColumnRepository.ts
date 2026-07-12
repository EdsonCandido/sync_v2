import { db } from "@sync_v2/db";
import { kanbanColumns } from "@sync_v2/db/schema/kanban";
import { and, asc, eq, max } from "drizzle-orm";

export const BASE_KANBAN_COLUMNS = [
	{ slug: "a_fazer", name: "A fazer", position: 0 },
	{ slug: "em_execucao", name: "Em execução", position: 1 },
	{ slug: "concluido", name: "Concluído", position: 2 },
	{ slug: "cancelado", name: "Cancelado", position: 3 },
] as const;

export class KanbanColumnRepository {
	async listByCompany(companyId: string) {
		return db
			.select()
			.from(kanbanColumns)
			.where(
				and(
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.ativo, true),
				),
			)
			.orderBy(asc(kanbanColumns.position));
	}

	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(kanbanColumns)
			.where(
				and(
					eq(kanbanColumns.id, id),
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findBySlugAny(companyId: string, slug: string) {
		const [row] = await db
			.select()
			.from(kanbanColumns)
			.where(
				and(
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.slug, slug),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async reactivate(id: string, data: { name: string; position: number }) {
		const [row] = await db
			.update(kanbanColumns)
			.set({
				ativo: true,
				name: data.name,
				position: data.position,
				updatedAt: new Date(),
			})
			.where(eq(kanbanColumns.id, id))
			.returning();
		return row ?? null;
	}

	async countBase(companyId: string) {
		const rows = await db
			.select()
			.from(kanbanColumns)
			.where(
				and(
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.isBase, true),
					eq(kanbanColumns.ativo, true),
				),
			);
		return rows.length;
	}

	async insertBaseColumns(companyId: string) {
		const values = BASE_KANBAN_COLUMNS.map((col) => ({
			companyId,
			name: col.name,
			slug: col.slug,
			isBase: true,
			position: col.position,
		}));
		return db.insert(kanbanColumns).values(values).returning();
	}

	async nextPosition(companyId: string) {
		const [row] = await db
			.select({ value: max(kanbanColumns.position) })
			.from(kanbanColumns)
			.where(
				and(
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.ativo, true),
				),
			);
		return (row?.value ?? -1) + 1;
	}

	async create(data: {
		companyId: string;
		name: string;
		slug: string;
		position: number;
		isBase?: boolean;
	}) {
		const [row] = await db
			.insert(kanbanColumns)
			.values({
				companyId: data.companyId,
				name: data.name,
				slug: data.slug,
				position: data.position,
				isBase: data.isBase ?? false,
			})
			.returning();
		return row;
	}

	async softDelete(id: string, companyId: string) {
		const [row] = await db
			.update(kanbanColumns)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanColumns.id, id),
					eq(kanbanColumns.companyId, companyId),
					eq(kanbanColumns.ativo, true),
					eq(kanbanColumns.isBase, false),
				),
			)
			.returning();
		return row ?? null;
	}
}
