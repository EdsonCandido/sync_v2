import { useEffect, useRef } from "react";

import { agendamentosApi } from "@/lib/agendamentos-api";
import { notificationsApi } from "@/lib/notifications-api";
import {
	ensureNotificationPermission,
	resolveLocalStart,
	showSystemReminder,
} from "@/lib/reminder-alerts";

type ReminderChannel = "t30" | "at_time";

/**
 * Agenda timers locais (T-30 + na hora) enquanto o dashboard está aberto.
 * Dispara notificação nativa + som; sync no server via poll de notificações.
 */
export function useAppointmentReminderAlerts(userId: string | undefined) {
	const firedRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!userId) return;

		ensureNotificationPermission();
		const timers: number[] = [];
		let cancelled = false;

		function key(id: string, channel: ReminderChannel) {
			return `${id}:${channel}`;
		}

		function fire(
			appointmentId: string,
			channel: ReminderChannel,
			title: string,
			body: string,
		) {
			const k = key(appointmentId, channel);
			if (firedRef.current.has(k)) return;
			firedRef.current.add(k);
			showSystemReminder({
				title,
				body,
				tag: k,
				appointmentId,
				withSound: true,
			});
			void notificationsApi.list().catch(() => {
				/* sync server deliveries */
			});
		}

		async function schedule() {
			if (cancelled) return;
			try {
				const now = new Date();
				const from = new Date(now);
				from.setHours(0, 0, 0, 0);
				const to = new Date(from);
				to.setDate(to.getDate() + 1);
				to.setHours(23, 59, 59, 999);

				const { items } = await agendamentosApi.list({
					from: from.toISOString(),
					to: to.toISOString(),
				});

				for (const a of items) {
					if (!a.remindEnabled || a.userId !== userId) continue;
					const start = resolveLocalStart(a);
					if (!start) continue;

					const msUntil = start.getTime() - Date.now();

					if (a.slotKind === "timed") {
						const t30 = msUntil - 30 * 60_000;
						if (t30 > 0 && t30 < 24 * 60 * 60_000) {
							timers.push(
								window.setTimeout(() => {
									fire(
										a.id,
										"t30",
										"Agendamento em 30 minutos",
										`${a.title} começa em breve.`,
									);
								}, t30),
							);
						} else if (t30 <= 0 && msUntil > 0) {
							fire(
								a.id,
								"t30",
								"Agendamento em 30 minutos",
								`${a.title} começa em breve.`,
							);
						}
					}

					if (msUntil > 0 && msUntil < 24 * 60 * 60_000) {
						timers.push(
							window.setTimeout(() => {
								fire(
									a.id,
									"at_time",
									"Agendamento agora",
									`${a.title} está começando.`,
								);
							}, msUntil),
						);
					} else if (msUntil <= 0 && msUntil > -2 * 60_000) {
						fire(
							a.id,
							"at_time",
							"Agendamento agora",
							`${a.title} está começando.`,
						);
					}
				}
			} catch {
				/* sem permissão de módulo / rede — ignore */
			}
		}

		void schedule();
		const rescheduleId = window.setInterval(() => {
			for (const t of timers) window.clearTimeout(t);
			timers.length = 0;
			void schedule();
		}, 5 * 60_000);

		return () => {
			cancelled = true;
			window.clearInterval(rescheduleId);
			for (const t of timers) window.clearTimeout(t);
		};
	}, [userId]);
}
