import { db } from "@sync_v2/db";
import {
	kanbanBoardMembers,
	kanbanBoards,
	kanbanColumns,
} from "@sync_v2/db/schema/kanban";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";

export class KanbanBoardRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(kanbanBoards)
			.where(
				and(
					eq(kanbanBoards.id, id),
					eq(kanbanBoards.companyId, companyId),
					eq(kanbanBoards.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findDefault(companyId: string) {
		const [row] = await db
			.select()
			.from(kanbanBoards)
			.where(
				and(
					eq(kanbanBoards.companyId, companyId),
					eq(kanbanBoards.isDefault, true),
					eq(kanbanBoards.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async listByCompany(companyId: string) {
		return db
			.select()
			.from(kanbanBoards)
			.where(
				and(
					eq(kanbanBoards.companyId, companyId),
					eq(kanbanBoards.ativo, true),
				),
			)
			.orderBy(asc(kanbanBoards.priority), asc(kanbanBoards.createdAt));
	}

	async create(data: {
		companyId: string;
		name: string;
		isDefault: boolean;
		priority: number;
		createdBy?: string | null;
	}) {
		const [row] = await db
			.insert(kanbanBoards)
			.values({
				companyId: data.companyId,
				name: data.name,
				isDefault: data.isDefault,
				priority: data.priority,
				createdBy: data.createdBy ?? null,
			})
			.returning();
		if (!row) {
			throw new Error("Falha ao inserir kanban.");
		}
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: { name?: string; priority?: number },
	) {
		const [row] = await db
			.update(kanbanBoards)
			.set({
				...(data.name !== undefined ? { name: data.name } : {}),
				...(data.priority !== undefined ? { priority: data.priority } : {}),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(kanbanBoards.id, id),
					eq(kanbanBoards.companyId, companyId),
					eq(kanbanBoards.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string) {
		const [row] = await db
			.update(kanbanBoards)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanBoards.id, id),
					eq(kanbanBoards.companyId, companyId),
					eq(kanbanBoards.ativo, true),
					eq(kanbanBoards.isDefault, false),
				),
			)
			.returning();
		return row ?? null;
	}

	async listMemberUserIds(boardId: string) {
		const rows = await db
			.select({ userId: kanbanBoardMembers.userId })
			.from(kanbanBoardMembers)
			.where(
				and(
					eq(kanbanBoardMembers.boardId, boardId),
					eq(kanbanBoardMembers.ativo, true),
				),
			);
		return rows.map((r) => r.userId);
	}

	async listMembersByBoardIds(boardIds: string[]) {
		if (boardIds.length === 0) return [];
		return db
			.select({
				boardId: kanbanBoardMembers.boardId,
				userId: kanbanBoardMembers.userId,
			})
			.from(kanbanBoardMembers)
			.where(
				and(
					inArray(kanbanBoardMembers.boardId, boardIds),
					eq(kanbanBoardMembers.ativo, true),
				),
			);
	}

	async isMember(boardId: string, userId: string) {
		const [row] = await db
			.select({ id: kanbanBoardMembers.id })
			.from(kanbanBoardMembers)
			.where(
				and(
					eq(kanbanBoardMembers.boardId, boardId),
					eq(kanbanBoardMembers.userId, userId),
					eq(kanbanBoardMembers.ativo, true),
				),
			)
			.limit(1);
		return Boolean(row);
	}

	async findMemberAny(boardId: string, userId: string) {
		const [row] = await db
			.select()
			.from(kanbanBoardMembers)
			.where(
				and(
					eq(kanbanBoardMembers.boardId, boardId),
					eq(kanbanBoardMembers.userId, userId),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async addMember(boardId: string, userId: string) {
		const existing = await this.findMemberAny(boardId, userId);
		if (existing) {
			if (existing.ativo) return existing;
			const [row] = await db
				.update(kanbanBoardMembers)
				.set({ ativo: true, updatedAt: new Date() })
				.where(eq(kanbanBoardMembers.id, existing.id))
				.returning();
			return row;
		}
		const [row] = await db
			.insert(kanbanBoardMembers)
			.values({ boardId, userId })
			.returning();
		return row;
	}

	async softDeleteMember(boardId: string, userId: string) {
		const [row] = await db
			.update(kanbanBoardMembers)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanBoardMembers.boardId, boardId),
					eq(kanbanBoardMembers.userId, userId),
					eq(kanbanBoardMembers.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDeleteAllMembers(boardId: string) {
		await db
			.update(kanbanBoardMembers)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanBoardMembers.boardId, boardId),
					eq(kanbanBoardMembers.ativo, true),
				),
			);
	}

	async syncMembers(boardId: string, userIds: string[]) {
		const current = await this.listMemberUserIds(boardId);
		const desired = new Set(userIds);
		const currentSet = new Set(current);

		for (const userId of current) {
			if (!desired.has(userId)) {
				await this.softDeleteMember(boardId, userId);
			}
		}
		for (const userId of desired) {
			if (!currentSet.has(userId)) {
				await this.addMember(boardId, userId);
			}
		}
		return this.listMemberUserIds(boardId);
	}

	async backfillColumnsWithoutBoard(companyId: string, boardId: string) {
		await db
			.update(kanbanColumns)
			.set({ boardId, updatedAt: new Date() })
			.where(
				and(
					eq(kanbanColumns.companyId, companyId),
					isNull(kanbanColumns.boardId),
				),
			);
	}

	async listAccessibleBoardIds(params: {
		companyId: string;
		userId: string;
		perfil: string;
	}) {
		const boards = await this.listByCompany(params.companyId);
		if (params.perfil === "admin_empresa") {
			return boards.map((b) => b.id);
		}
		const boardIds = boards.map((b) => b.id);
		const members = await this.listMembersByBoardIds(boardIds);
		const memberBoardIds = new Set(
			members.filter((m) => m.userId === params.userId).map((m) => m.boardId),
		);
		return boards
			.filter(
				(b) =>
					b.isDefault ||
					b.createdBy === params.userId ||
					memberBoardIds.has(b.id),
			)
			.map((b) => b.id);
	}
}
