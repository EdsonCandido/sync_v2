import { AccessEventRepository } from "../repositories/AccessEventRepository";
import { UserRepository } from "../repositories/UserRepository";

export class RecordUserAccessService {
	constructor(
		private readonly accessEventRepository = new AccessEventRepository(),
		private readonly userRepository = new UserRepository(),
	) {}

	async execute(input: {
		userId: string;
		companyId: string | null | undefined;
	}) {
		const now = new Date();
		const tasks: Promise<unknown>[] = [
			this.userRepository.updateLastAccess(input.userId, now),
		];
		if (input.companyId) {
			tasks.push(
				this.accessEventRepository.create({
					companyId: input.companyId,
					userId: input.userId,
					accessedAt: now,
				}),
			);
		}
		await Promise.all(tasks);
	}
}
