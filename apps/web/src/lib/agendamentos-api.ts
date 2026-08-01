import { apiFetch } from "./api";

export type AppointmentSlotKind =
	| "timed"
	| "all_day"
	| "morning"
	| "afternoon";

export type Appointment = {
	id: string;
	companyId: string;
	userId: string;
	title: string;
	notes: string | null;
	slotKind: AppointmentSlotKind;
	date: string;
	startsAt: string | null;
	endsAt: string | null;
	remindEnabled: boolean;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type AppointmentInput = {
	title: string;
	notes?: string | null;
	slotKind: AppointmentSlotKind;
	date: string;
	startsAt?: string | null;
	endsAt?: string | null;
	remindEnabled?: boolean;
};

export const agendamentosApi = {
	list: (params?: { from?: string; to?: string }) => {
		const qs = new URLSearchParams();
		if (params?.from) qs.set("from", params.from);
		if (params?.to) qs.set("to", params.to);
		const q = qs.toString();
		return apiFetch<{ items: Appointment[] }>(
			`/api/agendamentos${q ? `?${q}` : ""}`,
		);
	},
	find: (id: string) => apiFetch<Appointment>(`/api/agendamentos/${id}`),
	create: (body: AppointmentInput) =>
		apiFetch<Appointment>("/api/agendamentos", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	update: (id: string, body: Partial<AppointmentInput>) =>
		apiFetch<Appointment>(`/api/agendamentos/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	remove: (id: string) =>
		apiFetch<Appointment>(`/api/agendamentos/${id}`, {
			method: "DELETE",
		}),
};
