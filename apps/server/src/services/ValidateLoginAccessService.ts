import { CompanyRepository } from "../repositories/CompanyRepository";
import { PlanRepository } from "../repositories/PlanRepository";
import { UserRepository } from "../repositories/UserRepository";

export class ValidateLoginAccessService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly planRepository = new PlanRepository(),
		private readonly userRepository = new UserRepository(),
	) {}

	async execute(input: {
		userId: string;
		perfil: string;
		companyId: string | null | undefined;
		ativo?: boolean | null;
		blocked?: boolean | null;
	}): Promise<{ ok: true } | { ok: false; message: string }> {
		const fresh = await this.userRepository.findById(input.userId);
		if (!fresh) {
			return { ok: false, message: "Usuário inativo." };
		}
		if (!fresh.ativo || input.ativo === false) {
			return { ok: false, message: "Usuário inativo." };
		}
		if (fresh.blocked || input.blocked === true) {
			return { ok: false, message: "Usuário bloqueado." };
		}

		if (input.perfil === "super") {
			return { ok: true };
		}

		if (!input.companyId) {
			return { ok: false, message: "Empresa inativa." };
		}

		const company = await this.companyRepository.findByIdAny(input.companyId);

		if (!company || !company.ativo) {
			return { ok: false, message: "Empresa inativa." };
		}

		const plan = await this.planRepository.findByIdAny(company.planId);

		if (!plan) {
			return { ok: false, message: "Empresa sem plano." };
		}

		if (!plan.ativo) {
			return { ok: false, message: "Plano inativo." };
		}

		const now = new Date();
		if (now > company.planExpiresAt) {
			return { ok: false, message: "Plano expirado." };
		}

		return { ok: true };
	}
}
