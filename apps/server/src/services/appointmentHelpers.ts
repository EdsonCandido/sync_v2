import type { AppointmentSlotKind } from "@sync_v2/contracts";

/** Resolve horário implícito de blocos (negócio). */
export function resolveAppointmentBounds(params: {
	slotKind: AppointmentSlotKind;
	date: Date;
	startsAt?: Date | null;
	endsAt?: Date | null;
}): { startsAt: Date | null; endsAt: Date | null } {
	const day = new Date(params.date);
	day.setHours(0, 0, 0, 0);

	if (params.slotKind === "timed") {
		return {
			startsAt: params.startsAt ?? null,
			endsAt: params.endsAt ?? null,
		};
	}

	if (params.slotKind === "all_day") {
		const start = new Date(day);
		const end = new Date(day);
		end.setHours(23, 59, 59, 999);
		return { startsAt: start, endsAt: end };
	}

	if (params.slotKind === "morning") {
		const start = new Date(day);
		start.setHours(8, 0, 0, 0);
		const end = new Date(day);
		end.setHours(12, 0, 0, 0);
		return { startsAt: start, endsAt: end };
	}

	const start = new Date(day);
	start.setHours(12, 0, 0, 0);
	const end = new Date(day);
	end.setHours(18, 0, 0, 0);
	return { startsAt: start, endsAt: end };
}

export function startOfLocalDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

export function addDays(d: Date, days: number) {
	const x = new Date(d);
	x.setDate(x.getDate() + days);
	return x;
}

export function formatRelativeTime(date: Date, now = new Date()) {
	const diffMs = now.getTime() - date.getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "agora";
	if (mins < 60) return `há ${mins} min`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `há ${hours} h`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "ontem";
	return `há ${days} d`;
}

export function timelineToneFromAction(
	action: string,
): "info" | "success" | "warning" | "error" {
	const a = action.toLowerCase();
	if (
		a.includes("erro") ||
		a.includes("falha") ||
		a.includes("bloque") ||
		a.includes("cancel")
	) {
		return "error";
	}
	if (
		a.includes("atras") ||
		a.includes("vence") ||
		a.includes("alerta") ||
		a.includes("penden")
	) {
		return "warning";
	}
	if (
		a.includes("liquid") ||
		a.includes("pago") ||
		a.includes("conclu") ||
		a.includes("aprov")
	) {
		return "success";
	}
	return "info";
}
