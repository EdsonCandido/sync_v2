import { LoginAccessLogRepository } from "../repositories/LoginAccessLogRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { LookupGeoIpService } from "./LookupGeoIpService";

export class RecordLoginAccessService {
	constructor(
		private readonly loginAccessLogRepository = new LoginAccessLogRepository(),
		private readonly sessionRepository = new SessionRepository(),
		private readonly lookupGeoIpService = new LookupGeoIpService(),
	) {}

	async execute(input: {
		userId: string;
		companyId: string | null | undefined;
		sessionToken?: string | null;
		sessionId?: string | null;
		ipAddress: string | null;
		userAgent: string | null;
	}) {
		const sessionId =
			input.sessionId ??
			(input.sessionToken
				? await this.sessionRepository.findIdByToken(input.sessionToken)
				: null);

		const row = await this.loginAccessLogRepository.create({
			userId: input.userId,
			companyId: input.companyId ?? null,
			sessionId,
			ipAddress: input.ipAddress,
			userAgent: input.userAgent,
		});

		if (!row?.id) {
			return;
		}

		const logId = row.id;
		void this.lookupGeoIpService
			.execute(input.ipAddress)
			.then((geo) => {
				if (!geo) return;
				return this.loginAccessLogRepository.updateGeo(logId, geo);
			})
			.catch(() => {
				// geo lookup must not block or fail login
			});
	}
}
