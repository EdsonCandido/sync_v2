import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import type { ActorContext } from "./UserAccessRules";

export class FindUserService {
	constructor(private readonly userRepository = new UserRepository()) {}

	async execute(id: string, actor: ActorContext) {
		const target = await this.userRepository.findById(id);
		if (!target) {
			throw new AppError(404, "Usuário não encontrado.");
		}

		if (actor.actorPerfil === "super") {
			return target;
		}

		if (!actor.actorCompanyId || target.companyId !== actor.actorCompanyId) {
			throw new AppError(403, "Usuário fora do escopo da empresa.");
		}

		return target;
	}
}
