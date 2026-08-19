import { isPrivateOrLocalIp } from "../utils/clientIp";

export type GeoIpResult = {
	country: string | null;
	region: string | null;
	city: string | null;
};

export class LookupGeoIpService {
	async execute(ip: string | null | undefined): Promise<GeoIpResult | null> {
		if (!ip || isPrivateOrLocalIp(ip)) {
			return null;
		}

		const encoded = encodeURIComponent(ip);
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 2500);

		try {
			const response = await fetch(`https://ipwho.is/${encoded}`, {
				signal: controller.signal,
				headers: { Accept: "application/json" },
			});
			if (!response.ok) {
				return null;
			}
			const body = (await response.json()) as {
				success?: boolean;
				country?: string;
				region?: string;
				city?: string;
			};
			if (body.success === false) {
				return null;
			}
			return {
				country: body.country?.trim() || null,
				region: body.region?.trim() || null,
				city: body.city?.trim() || null,
			};
		} catch {
			return null;
		} finally {
			clearTimeout(timer);
		}
	}
}
