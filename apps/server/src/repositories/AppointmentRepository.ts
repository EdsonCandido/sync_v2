import type {
	CreateAppointmentInput,
	UpdateAppointmentInput,
} from "@sync_v2/contracts";
import { db } from "@sync_v2/db";
import { appointments } from "@sync_v2/db/schema/agendamentos";
import { and, asc, eq, gte, lte } from "drizzle-orm";

export class AppointmentRepository {
	async findById(id: string, companyId: string) {
		const [row] = await db
			.select()
			.from(appointments)
			.where(
				and(
					eq(appointments.id, id),
					eq(appointments.companyId, companyId),
					eq(appointments.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async list(params: {
		companyId: string;
		from?: Date;
		to?: Date;
		userId?: string;
	}) {
		const conditions = [
			eq(appointments.companyId, params.companyId),
			eq(appointments.ativo, true),
		];
		if (params.userId) {
			conditions.push(eq(appointments.userId, params.userId));
		}
		if (params.from) {
			conditions.push(gte(appointments.date, params.from));
		}
		if (params.to) {
			conditions.push(lte(appointments.date, params.to));
		}
		return db
			.select()
			.from(appointments)
			.where(and(...conditions))
			.orderBy(asc(appointments.date), asc(appointments.startsAt));
	}

	async listRemindableForUser(params: {
		companyId: string;
		userId: string;
		from: Date;
		to: Date;
	}) {
		return db
			.select()
			.from(appointments)
			.where(
				and(
					eq(appointments.companyId, params.companyId),
					eq(appointments.userId, params.userId),
					eq(appointments.ativo, true),
					eq(appointments.remindEnabled, true),
					gte(appointments.date, params.from),
					lte(appointments.date, params.to),
				),
			)
			.orderBy(asc(appointments.date));
	}

	async listTimedRemindableNear(params: {
		companyId: string;
		userId: string;
		windowStart: Date;
		windowEnd: Date;
	}) {
		return db
			.select()
			.from(appointments)
			.where(
				and(
					eq(appointments.companyId, params.companyId),
					eq(appointments.userId, params.userId),
					eq(appointments.ativo, true),
					eq(appointments.remindEnabled, true),
					eq(appointments.slotKind, "timed"),
					gte(appointments.startsAt, params.windowStart),
					lte(appointments.startsAt, params.windowEnd),
				),
			);
	}

	async create(
		data: CreateAppointmentInput & {
			companyId: string;
			userId: string;
			createdBy?: string | null;
			updatedBy?: string | null;
		},
	) {
		const [row] = await db
			.insert(appointments)
			.values({
				companyId: data.companyId,
				userId: data.userId,
				title: data.title,
				notes: data.notes ?? null,
				slotKind: data.slotKind,
				date: data.date,
				startsAt: data.startsAt ?? null,
				endsAt: data.endsAt ?? null,
				remindEnabled: data.remindEnabled ?? false,
				createdBy: data.createdBy ?? null,
				updatedBy: data.updatedBy ?? null,
			})
			.returning();
		return row;
	}

	async update(
		id: string,
		companyId: string,
		data: UpdateAppointmentInput & { updatedBy?: string | null },
	) {
		const [row] = await db
			.update(appointments)
			.set({
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.notes !== undefined ? { notes: data.notes } : {}),
				...(data.slotKind !== undefined ? { slotKind: data.slotKind } : {}),
				...(data.date !== undefined ? { date: data.date } : {}),
				...(data.startsAt !== undefined ? { startsAt: data.startsAt } : {}),
				...(data.endsAt !== undefined ? { endsAt: data.endsAt } : {}),
				...(data.remindEnabled !== undefined
					? { remindEnabled: data.remindEnabled }
					: {}),
				updatedBy: data.updatedBy ?? null,
			})
			.where(
				and(
					eq(appointments.id, id),
					eq(appointments.companyId, companyId),
					eq(appointments.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}

	async softDelete(id: string, companyId: string, updatedBy?: string | null) {
		const [row] = await db
			.update(appointments)
			.set({
				ativo: false,
				updatedBy: updatedBy ?? null,
			})
			.where(
				and(
					eq(appointments.id, id),
					eq(appointments.companyId, companyId),
					eq(appointments.ativo, true),
				),
			)
			.returning();
		return row ?? null;
	}
}
