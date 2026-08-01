import { apiFetch } from "./api";

export type AppNotification = {
	id: string;
	userId: string;
	companyId: string | null;
	title: string;
	body: string;
	kind: "appointment_reminder";
	appointmentId: string | null;
	readAt: string | null;
	createdAt: string;
};

export type NotificationsList = {
	items: AppNotification[];
	unreadCount: number;
};

export const notificationsApi = {
	list: () => apiFetch<NotificationsList>("/api/notifications"),
	markRead: (id: string) =>
		apiFetch<AppNotification>(`/api/notifications/${id}/read`, {
			method: "PATCH",
		}),
	markAllRead: () =>
		apiFetch<{ ok: true }>("/api/notifications/read-all", {
			method: "POST",
		}),
};
