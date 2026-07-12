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
		if (!input.companyId) {
			return;
		}

		const now = new Date();
		await Promise.all([
			this.accessEventRepository.create({
				companyId: input.companyId,
				userId: input.userId,
				accessedAt: now,
			}),
			this.userRepository.updateLastAccess(input.userId, now),
		]);
	}
}
