import type { AppointmentSlotKind } from "@sync_v2/contracts";
import { AppointmentReminderDeliveryRepository } from "../repositories/AppointmentReminderDeliveryRepository";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import {
	addDays,
	resolveAppointmentBounds,
	startOfLocalDay,
} from "./appointmentHelpers";

const T30_MS = 30 * 60_000;
const AT_TIME_GRACE_MS = 2 * 60_000;

export class SyncAppointmentRemindersService {
	constructor(
		private readonly appointmentRepository = new AppointmentRepository(),
		private readonly deliveryRepository = new AppointmentReminderDeliveryRepository(),
		private readonly notificationRepository = new NotificationRepository(),
	) {}

	async execute(params: { companyId: string; userId: string }) {
		const now = new Date();
		const today = startOfLocalDay(now);
		const upcoming = await this.appointmentRepository.listRemindableForUser({
			companyId: params.companyId,
			userId: params.userId,
			from: today,
			to: addDays(today, 1),
		});

		for (const appt of upcoming) {
			await this.deliverIfNeeded({
				appointmentId: appt.id,
				userId: params.userId,
				companyId: params.companyId,
				channel: "on_open",
				title: "Lembrete de agendamento",
				body: this.bodyFor(appt.title, appt.slotKind, appt.startsAt),
			});

			const bounds = resolveAppointmentBounds({
				slotKind: appt.slotKind as AppointmentSlotKind,
				date: appt.date,
				startsAt: appt.startsAt,
				endsAt: appt.endsAt,
			});
			const start = bounds.startsAt;
			if (!start) continue;

			const msUntil = start.getTime() - now.getTime();

			if (appt.slotKind === "timed" && msUntil <= T30_MS && msUntil >= 0) {
				await this.deliverIfNeeded({
					appointmentId: appt.id,
					userId: params.userId,
					companyId: params.companyId,
					channel: "t30",
					title: "Agendamento em 30 minutos",
					body: `${appt.title} começa em breve.`,
				});
			}

			if (msUntil <= AT_TIME_GRACE_MS && msUntil >= -AT_TIME_GRACE_MS) {
				await this.deliverIfNeeded({
					appointmentId: appt.id,
					userId: params.userId,
					companyId: params.companyId,
					channel: "at_time",
					title: "Agendamento agora",
					body: `${appt.title} está começando.`,
				});
			}
		}
	}

	private bodyFor(title: string, slotKind: string, startsAt: Date | null) {
		if (slotKind === "timed" && startsAt) {
			const hh = startsAt.toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
			return `${title} · ${hh}`;
		}
		const labels: Record<string, string> = {
			all_day: "dia todo",
			morning: "manhã",
			afternoon: "tarde",
		};
		return `${title} · ${labels[slotKind] ?? slotKind}`;
	}

	private async deliverIfNeeded(params: {
		appointmentId: string;
		userId: string;
		companyId: string;
		channel: string;
		title: string;
		body: string;
	}) {
		const existing = await this.deliveryRepository.findDelivery({
			appointmentId: params.appointmentId,
			userId: params.userId,
			channel: params.channel,
		});
		if (existing) return;

		await this.notificationRepository.create({
			userId: params.userId,
			companyId: params.companyId,
			title: params.title,
			body: params.body,
			kind: "appointment_reminder",
			appointmentId: params.appointmentId,
			createdBy: params.userId,
		});
		await this.deliveryRepository.create({
			appointmentId: params.appointmentId,
			userId: params.userId,
			channel: params.channel,
			createdBy: params.userId,
		});
	}
}
