import { NotificationRepository } from "../repositories/NotificationRepository";
import { SyncAppointmentRemindersService } from "./SyncAppointmentRemindersService";

export class ListNotificationsService {
	constructor(
		private readonly notificationRepository = new NotificationRepository(),
		private readonly syncReminders = new SyncAppointmentRemindersService(),
	) {}

	async execute(params: { userId: string; companyId: string | null }) {
		if (params.companyId) {
			await this.syncReminders.execute({
				companyId: params.companyId,
				userId: params.userId,
			});
		}

		const [items, unreadCount] = await Promise.all([
			this.notificationRepository.listByUser(params.userId),
			this.notificationRepository.countUnread(params.userId),
		]);

		return {
			items: items.map((n) => ({
				id: n.id,
				userId: n.userId,
				companyId: n.companyId,
				title: n.title,
				body: n.body,
				kind: n.kind as "appointment_reminder",
				appointmentId: n.appointmentId,
				readAt: n.readAt,
				createdAt: n.createdAt,
			})),
			unreadCount,
		};
	}
}
