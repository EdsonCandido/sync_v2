import { NotificationRepository } from "../repositories/NotificationRepository";

export class MarkAllNotificationsReadService {
	constructor(
		private readonly notificationRepository = new NotificationRepository(),
	) {}

	async execute(userId: string) {
		await this.notificationRepository.markAllRead(userId);
		return { ok: true as const };
	}
}
