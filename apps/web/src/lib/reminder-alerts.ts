/** Som curto de alerta (Web Audio) — sem arquivo externo. */
export function playReminderChime() {
	if (typeof window === "undefined") return;
	try {
		const Ctx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!Ctx) return;
		const ctx = new Ctx();
		const now = ctx.currentTime;

		const beep = (freq: number, start: number, dur: number) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(0.0001, now + start);
			gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + start);
			osc.stop(now + start + dur + 0.02);
		};

		beep(880, 0, 0.14);
		beep(1174.7, 0.16, 0.18);

		window.setTimeout(() => {
			void ctx.close();
		}, 600);
	} catch {
		/* autoplay / audio bloqueado — ignore */
	}
}

const shownTags = new Set<string>();

export function claimReminderTag(tag: string): boolean {
	if (shownTags.has(tag)) return false;
	shownTags.add(tag);
	return true;
}

export function ensureNotificationPermission() {
	if (typeof window === "undefined" || !("Notification" in window)) return;
	if (Notification.permission === "default") {
		void Notification.requestPermission();
	}
}

export function showSystemReminder(params: {
	title: string;
	body: string;
	tag: string;
	appointmentId?: string | null;
	withSound?: boolean;
}) {
	const dedupe = params.appointmentId
		? `appt:${params.appointmentId}:${params.title}`
		: params.tag;
	if (!claimReminderTag(dedupe)) return;
	claimReminderTag(params.tag);

	if (params.withSound !== false) playReminderChime();
	if (typeof window === "undefined" || !("Notification" in window)) return;
	if (Notification.permission !== "granted") return;
	try {
		new Notification(params.title, {
			body: params.body,
			tag: dedupe,
			requireInteraction: true,
		});
	} catch {
		/* ignore */
	}
}

export function resolveLocalStart(a: {
	slotKind: string;
	date: string;
	startsAt: string | null;
}): Date | null {
	const day = new Date(a.date);
	day.setHours(0, 0, 0, 0);
	if (a.slotKind === "timed") {
		return a.startsAt ? new Date(a.startsAt) : null;
	}
	if (a.slotKind === "all_day") return day;
	if (a.slotKind === "morning") {
		const s = new Date(day);
		s.setHours(8, 0, 0, 0);
		return s;
	}
	if (a.slotKind === "afternoon") {
		const s = new Date(day);
		s.setHours(12, 0, 0, 0);
		return s;
	}
	return null;
}
