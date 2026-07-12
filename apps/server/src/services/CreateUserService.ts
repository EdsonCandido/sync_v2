import type { CreateUserInput } from "@sync_v2/contracts";
import type { UserPerfil } from "@sync_v2/types";
import { auth } from "../auth";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";
import { type ActorContext, assertCanCreatePerfil } from "./UserAccessRules";

export class CreateUserService {
	constructor(
		private readonly userRepository = new UserRepository(),
		private readonly companyRepository = new CompanyRepository(),
	) {}

	async execute(input: CreateUserInput, actor: ActorContext) {
		const email = input.email.toLowerCase().trim();
		const existing = await this.userRepository.findByEmail(email);
		if (existing) {
			throw new AppError(409, "E-mail já cadastrado.");
		}

		const companyId = assertCanCreatePerfil(
			actor,
			input.perfil as UserPerfil,
			input.companyId,
		);

		if (companyId) {
			const company = await this.companyRepository.findById(companyId);
			if (!company) {
				throw new AppError(400, "Empresa não encontrada.");
			}
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name: input.name.trim(),
					email,
					password: input.password,
				},
			});
		} catch (error) {
			const message =
				error &&
				typeof error === "object" &&
				"message" in error &&
				typeof (error as { message: unknown }).message === "string"
					? (error as { message: string }).message
					: "Falha ao criar usuário.";
			throw new AppError(400, message);
		}

		const created = await this.userRepository.findByEmail(email);
		if (!created) {
			throw new AppError(500, "Usuário criado sem registro local.");
		}

		await this.userRepository.updateDomain(created.id, {
			name: input.name.trim(),
			email,
			perfil: input.perfil,
			companyId,
			department: input.department?.trim() || null,
			ativo: input.ativo ?? true,
			createdBy: actor.actorId,
			updatedBy: actor.actorId,
		});

		const full = await this.userRepository.findById(created.id);
		if (!full) {
			throw new AppError(500, "Falha ao carregar usuário criado.");
		}
		return full;
	}
}
