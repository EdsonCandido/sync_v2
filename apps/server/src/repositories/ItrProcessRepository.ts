import { db } from "@sync_v2/db";
import { clients } from "@sync_v2/db/schema/clients";
import { itrFiles, itrProcesses } from "@sync_v2/db/schema/itr";
import { kanbanCards, kanbanColumns } from "@sync_v2/db/schema/kanban";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

export class ItrProcessRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select({
				process: itrProcesses,
				clientName: clients.name,
				clientDocument: clients.document,
				columnSlug: kanbanColumns.slug,
				columnName: kanbanColumns.name,
			})
			.from(itrProcesses)
			.innerJoin(clients, eq(itrProcesses.clientId, clients.id))
			.innerJoin(kanbanCards, eq(itrProcesses.kanbanCardId, kanbanCards.id))
			.innerJoin(kanbanColumns, eq(kanbanCards.columnId, kanbanColumns.id))
			.where(
				and(
					eq(itrProcesses.id, id),
					eq(itrProcesses.companyId, companyId),
					eq(itrProcesses.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async list(params: {
		companyId: string;
		q?: string;
		page: number;
		pageSize: number;
	}) {
		const offset = (params.page - 1) * params.pageSize;
		const search = params.q?.trim();

		const where = search
			? and(
					eq(itrProcesses.companyId, params.companyId),
					eq(itrProcesses.ativo, true),
					or(
						ilike(clients.name, `%${search}%`),
						ilike(clients.document, `%${search}%`),
					),
				)
			: and(
					eq(itrProcesses.companyId, params.companyId),
					eq(itrProcesses.ativo, true),
				);

		const [items, totalRow] = await Promise.all([
			db
				.select({
					process: itrProcesses,
					clientName: clients.name,
					clientDocument: clients.document,
					columnSlug: kanbanColumns.slug,
					columnName: kanbanColumns.name,
				})
				.from(itrProcesses)
				.innerJoin(clients, eq(itrProcesses.clientId, clients.id))
				.innerJoin(kanbanCards, eq(itrProcesses.kanbanCardId, kanbanCards.id))
				.innerJoin(kanbanColumns, eq(kanbanCards.columnId, kanbanColumns.id))
				.where(where)
				.orderBy(desc(itrProcesses.createdAt))
				.limit(params.pageSize)
				.offset(offset),
			db
				.select({ value: count() })
				.from(itrProcesses)
				.innerJoin(clients, eq(itrProcesses.clientId, clients.id))
				.where(where),
		]);

		return {
			items,
			total: totalRow[0]?.value ?? 0,
			page: params.page,
			pageSize: params.pageSize,
		};
	}

	async listByCompanyAndDocument(companyId: string, document: string) {
		return db
			.select({
				process: itrProcesses,
				clientName: clients.name,
				clientDocument: clients.document,
				columnSlug: kanbanColumns.slug,
				columnName: kanbanColumns.name,
			})
			.from(itrProcesses)
			.innerJoin(clients, eq(itrProcesses.clientId, clients.id))
			.innerJoin(kanbanCards, eq(itrProcesses.kanbanCardId, kanbanCards.id))
			.innerJoin(kanbanColumns, eq(kanbanCards.columnId, kanbanColumns.id))
			.where(
				and(
					eq(itrProcesses.companyId, companyId),
					eq(itrProcesses.ativo, true),
					eq(clients.document, document),
					eq(clients.ativo, true),
				),
			)
			.orderBy(desc(itrProcesses.createdAt));
	}

	async create(data: {
		companyId: string;
		clientId: string;
		kanbanCardId: string;
		financialEntryId: string;
		valor: number;
		observacoes?: string | null;
		createdBy?: string | null;
		updatedBy?: string | null;
	}) {
		const [row] = await db
			.insert(itrProcesses)
			.values({
				companyId: data.companyId,
				clientId: data.clientId,
				kanbanCardId: data.kanbanCardId,
				financialEntryId: data.financialEntryId,
				valor: data.valor,
				observacoes: data.observacoes ?? null,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: {
			observacoes?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.update(itrProcesses)
			.set({
				...(data.observacoes !== undefined
					? { observacoes: data.observacoes }
					: {}),
				updatedBy: data.updatedBy ?? null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(itrProcesses.id, id),
					eq(itrProcesses.companyId, companyId),
					eq(itrProcesses.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(itrProcesses)
			.set({
				ativo: false,
				updatedBy: updatedBy ?? null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(itrProcesses.id, id),
					eq(itrProcesses.companyId, companyId),
					eq(itrProcesses.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}

export class ItrFileRepository {
	async listByProcess(processId: string) {
		return db
			.select({
				id: itrFiles.id,
				kind: itrFiles.kind,
				originalName: itrFiles.originalName,
				mimeType: itrFiles.mimeType,
				sizeBytes: itrFiles.sizeBytes,
				createdAt: itrFiles.createdAt,
				uploadedBy: itrFiles.uploadedBy,
			})
			.from(itrFiles)
			.where(and(eq(itrFiles.processId, processId), eq(itrFiles.ativo, true)))
			.orderBy(desc(itrFiles.createdAt));
	}

	async countActiveByProcess(processId: string) {
		const [row] = await db
			.select({ value: count() })
			.from(itrFiles)
			.where(and(eq(itrFiles.processId, processId), eq(itrFiles.ativo, true)));
		return row?.value ?? 0;
	}

	async findById(id: string) {
		const [row] = await db
			.select()
			.from(itrFiles)
			.where(and(eq(itrFiles.id, id), eq(itrFiles.ativo, true)))
			.limit(1);
		return row ?? null;
	}

	async findByIdWithProcess(id: string) {
		const [row] = await db
			.select({
				file: itrFiles,
				process: itrProcesses,
				clientDocument: clients.document,
				columnSlug: kanbanColumns.slug,
			})
			.from(itrFiles)
			.innerJoin(itrProcesses, eq(itrFiles.processId, itrProcesses.id))
			.innerJoin(clients, eq(itrProcesses.clientId, clients.id))
			.innerJoin(kanbanCards, eq(itrProcesses.kanbanCardId, kanbanCards.id))
			.innerJoin(kanbanColumns, eq(kanbanCards.columnId, kanbanColumns.id))
			.where(
				and(
					eq(itrFiles.id, id),
					eq(itrFiles.ativo, true),
					eq(itrProcesses.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(data: {
		processId: string;
		kind: string;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
		content: Buffer;
		uploadedBy?: string | null;
	}) {
		const [row] = await db
			.insert(itrFiles)
			.values({
				processId: data.processId,
				kind: data.kind,
				originalName: data.originalName,
				mimeType: data.mimeType,
				sizeBytes: data.sizeBytes,
				content: data.content,
				uploadedBy: data.uploadedBy ?? null,
			})
			.returning({
				id: itrFiles.id,
				kind: itrFiles.kind,
				originalName: itrFiles.originalName,
				mimeType: itrFiles.mimeType,
				sizeBytes: itrFiles.sizeBytes,
				createdAt: itrFiles.createdAt,
				uploadedBy: itrFiles.uploadedBy,
			});
		return row;
	}

	async softDelete(id: string, processId: string) {
		const [row] = await db
			.update(itrFiles)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(itrFiles.id, id),
					eq(itrFiles.processId, processId),
					eq(itrFiles.ativo, true),
				),
			)
			.returning({
				id: itrFiles.id,
				kind: itrFiles.kind,
				originalName: itrFiles.originalName,
			});
		return row ?? null;
	}

	async softDeleteByProcess(processId: string) {
		await db
			.update(itrFiles)
			.set({ ativo: false, updatedAt: new Date() })
			.where(and(eq(itrFiles.processId, processId), eq(itrFiles.ativo, true)));
	}

	async softDeleteByProcessAndKind(processId: string, kind: string) {
		await db
			.update(itrFiles)
			.set({ ativo: false, updatedAt: new Date() })
			.where(
				and(
					eq(itrFiles.processId, processId),
					eq(itrFiles.kind, kind),
					eq(itrFiles.ativo, true),
				),
			);
	}
}
