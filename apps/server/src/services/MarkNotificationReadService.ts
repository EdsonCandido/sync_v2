import { NotificationRepository } from "../repositories/NotificationRepository";
import { AppError } from "../utils/AppError";

export class MarkNotificationReadService {
	constructor(
		private readonly notificationRepository = new NotificationRepository(),
	) {}

	async execute(id: string, userId: string) {
		const existing = await this.notificationRepository.findById(id, userId);
		if (!existing) throw new AppError(404, "Notificação não encontrada.");
		if (existing.readAt) return existing;
		const row = await this.notificationRepository.markRead(id, userId);
		return row ?? existing;
	}
}
