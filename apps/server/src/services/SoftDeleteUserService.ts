import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import {
	type ActorContext,
	assertCanManageTarget,
	isAdminOrSuper,
} from "./UserAccessRules";

export class SoftDeleteUserService {
	constructor(private readonly userRepository = new UserRepository()) {}

	async execute(id: string, actor: ActorContext) {
		if (!isAdminOrSuper(actor.actorPerfil)) {
			throw new AppError(403, "Sem permissão para desativar usuário.");
		}

		if (id === actor.actorId) {
			throw new AppError(400, "Não é possível desativar o próprio usuário.");
		}

		const target = await this.userRepository.findById(id);
		if (!target) {
			throw new AppError(404, "Usuário não encontrado.");
		}

		assertCanManageTarget(actor, target, { allowPasswordOrAtivo: true });

		await this.userRepository.softDelete(id, actor.actorId);
		const updated = await this.userRepository.findById(id);
		if (!updated) {
			throw new AppError(404, "Usuário não encontrado.");
		}
		return updated;
	}
}
