import type { ActiveSessionResponse } from "@sync_v2/contracts";
import { LoginAccessLogRepository } from "../repositories/LoginAccessLogRepository";
import { SessionRepository } from "../repositories/SessionRepository";

export class ListActiveSessionsService {
	constructor(
		private readonly sessionRepository = new SessionRepository(),
		private readonly loginAccessLogRepository = new LoginAccessLogRepository(),
	) {}

	async execute() {
		const [items, total] = await Promise.all([
			this.sessionRepository.listActive(),
			this.sessionRepository.countActive(),
		]);

		const geoRows = await this.loginAccessLogRepository.findGeoBySessionIds(
			items.map((row) => row.id),
		);
		const geoBySession = new Map<
			string,
			{ country: string | null; region: string | null; city: string | null }
		>();
		for (const geo of geoRows) {
			if (!geo.sessionId || geoBySession.has(geo.sessionId)) continue;
			geoBySession.set(geo.sessionId, {
				country: geo.country,
				region: geo.region,
				city: geo.city,
			});
		}

		const mapped: ActiveSessionResponse[] = items.map((row) => {
			const geo = geoBySession.get(row.id);
			return {
				id: row.id,
				userId: row.userId,
				userName: row.userName,
				userEmail: row.userEmail,
				perfil: row.perfil as ActiveSessionResponse["perfil"],
				companyId: row.companyId,
				companyName: row.companyName,
				ipAddress: row.ipAddress,
				userAgent: row.userAgent,
				country: geo?.country ?? null,
				region: geo?.region ?? null,
				city: geo?.city ?? null,
				expiresAt: row.expiresAt,
				createdAt: row.createdAt,
			};
		});

		return { items: mapped, total };
	}
}
