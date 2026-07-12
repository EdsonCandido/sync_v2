import type { AdminSetPasswordInput } from "@sync_v2/contracts";
import { hashPassword } from "better-auth/crypto";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import {
	type ActorContext,
	assertCanManageTarget,
	isAdminOrSuper,
} from "./UserAccessRules";

export class AdminSetUserPasswordService {
	constructor(private readonly userRepository = new UserRepository()) {}

	async execute(
		id: string,
		input: AdminSetPasswordInput,
		actor: ActorContext,
	) {
		if (!isAdminOrSuper(actor.actorPerfil)) {
			throw new AppError(403, "Sem permissão para definir senha.");
		}

		const target = await this.userRepository.findById(id);
		if (!target) {
			throw new AppError(404, "Usuário não encontrado.");
		}

		assertCanManageTarget(actor, target, { allowPasswordOrAtivo: true });

		const passwordHash = await hashPassword(input.password);
		await this.userRepository.updateCredentialPassword(id, passwordHash);
		await this.userRepository.updateDomain(id, {
			updatedBy: actor.actorId,
		});

		return { ok: true as const };
	}
}
