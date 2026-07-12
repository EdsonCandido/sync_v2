import type { UpdateUserInput } from "@sync_v2/contracts";
import type { UserPerfil } from "@sync_v2/types";
import { hashPassword } from "better-auth/crypto";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import {
	type ActorContext,
	assertCanUpdateFields,
	isAdminOrSuper,
} from "./UserAccessRules";

export class UpdateUserService {
	constructor(
		private readonly userRepository = new UserRepository(),
		private readonly companyRepository = new CompanyRepository(),
	) {}

	async execute(id: string, input: UpdateUserInput, actor: ActorContext) {
		const target = await this.userRepository.findById(id);
		if (!target) {
			throw new AppError(404, "Usuário não encontrado.");
		}

		assertCanUpdateFields(actor, target, {
			perfil: input.perfil as UserPerfil | undefined,
			companyId: input.companyId,
			password: input.password,
			ativo: input.ativo,
		});

		if (input.password !== undefined && !isAdminOrSuper(actor.actorPerfil)) {
			throw new AppError(403, "Sem permissão para alterar senha.");
		}
		if (input.ativo !== undefined && !isAdminOrSuper(actor.actorPerfil)) {
			throw new AppError(403, "Sem permissão para alterar status.");
		}

		const nextPerfil = (input.perfil ?? target.perfil) as UserPerfil;
		let nextCompanyId =
			input.companyId !== undefined ? input.companyId : target.companyId;

		if (actor.actorPerfil !== "super") {
			nextCompanyId = target.companyId;
		}

		if (nextPerfil === "super") {
			nextCompanyId = null;
		} else if (!nextCompanyId) {
			throw new AppError(400, "Empresa obrigatória para este perfil.");
		}

		if (nextCompanyId) {
			const company = await this.companyRepository.findById(nextCompanyId);
			if (!company) {
				throw new AppError(400, "Empresa não encontrada.");
			}
		}

		if (input.email) {
			const email = input.email.toLowerCase().trim();
			const byEmail = await this.userRepository.findByEmail(email, id);
			if (byEmail) {
				throw new AppError(409, "E-mail já cadastrado.");
			}
		}

		await this.userRepository.updateDomain(id, {
			name: input.name?.trim(),
			email: input.email?.toLowerCase().trim(),
			perfil: input.perfil,
			companyId: nextCompanyId,
			department:
				input.department !== undefined
					? input.department?.trim() || null
					: undefined,
			ativo: input.ativo,
			updatedBy: actor.actorId,
		});

		if (input.password && isAdminOrSuper(actor.actorPerfil)) {
			const passwordHash = await hashPassword(input.password);
			await this.userRepository.updateCredentialPassword(id, passwordHash);
		}

		const updated = await this.userRepository.findById(id);
		if (!updated) {
			throw new AppError(404, "Usuário não encontrado.");
		}
		return updated;
	}
}
