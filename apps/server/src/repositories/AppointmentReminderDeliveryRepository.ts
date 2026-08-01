import { db } from "@sync_v2/db";
import { appointmentReminderDeliveries } from "@sync_v2/db/schema/agendamentos";
import { and, eq } from "drizzle-orm";

export class AppointmentReminderDeliveryRepository {
	async findDelivery(params: {
		appointmentId: string;
		userId: string;
		channel: string;
	}) {
		const [row] = await db
			.select()
			.from(appointmentReminderDeliveries)
			.where(
				and(
					eq(
						appointmentReminderDeliveries.appointmentId,
						params.appointmentId,
					),
					eq(appointmentReminderDeliveries.userId, params.userId),
					eq(appointmentReminderDeliveries.channel, params.channel),
					eq(appointmentReminderDeliveries.ativo, true),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async create(params: {
		appointmentId: string;
		userId: string;
		channel: string;
		createdBy?: string | null;
	}) {
		const [row] = await db
			.insert(appointmentReminderDeliveries)
			.values({
				appointmentId: params.appointmentId,
				userId: params.userId,
				channel: params.channel,
				createdBy: params.createdBy ?? null,
				updatedBy: params.createdBy ?? null,
			})
			.returning();
		return row;
	}
}
