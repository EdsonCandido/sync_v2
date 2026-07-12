import type { ListUsersQuery } from "@sync_v2/contracts";
import { UserRepository } from "../repositories/UserRepository";
import { type ActorContext, resolveListCompanyScope } from "./UserAccessRules";

export class ListUsersService {
	constructor(private readonly userRepository = new UserRepository()) {}

	async execute(query: ListUsersQuery, actor: ActorContext) {
		const scopedCompanyId = resolveListCompanyScope(actor);
		const companyId =
			actor.actorPerfil === "super"
				? (query.companyId ?? null)
				: scopedCompanyId;

		return this.userRepository.list({
			q: query.q,
			page: query.page,
			pageSize: query.pageSize,
			companyId,
		});
	}
}
