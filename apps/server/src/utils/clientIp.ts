export function firstForwardedIp(value: string | null | undefined) {
	if (!value) return null;
	const first = value.split(",")[0]?.trim();
	return first && first.length > 0 ? first : null;
}

export function headerValue(
	headers:
		| { get?(name: string): string | null }
		| Record<string, unknown>
		| undefined,
	name: string,
): string | null {
	if (!headers) return null;
	if (typeof headers.get === "function") {
		return headers.get(name);
	}
	const rec = headers as Record<string, unknown>;
	const raw = rec[name] ?? rec[name.toLowerCase()];
	if (typeof raw === "string") return raw;
	if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
	return null;
}

export function extractClientIp(
	headers:
		| { get?(name: string): string | null }
		| Record<string, unknown>
		| undefined,
): string | null {
	const forwarded = firstForwardedIp(headerValue(headers, "x-forwarded-for"));
	if (forwarded) return forwarded;
	const realIp = headerValue(headers, "x-real-ip")?.trim();
	if (realIp) return realIp;
	return null;
}

export function isPrivateOrLocalIp(ip: string) {
	const value = ip.replace(/^::ffff:/, "").toLowerCase();
	if (value === "127.0.0.1" || value === "::1" || value === "localhost") {
		return true;
	}
	if (value.startsWith("10.")) return true;
	if (value.startsWith("192.168.")) return true;
	if (value.startsWith("172.")) {
		const second = Number(value.split(".")[1]);
		if (second >= 16 && second <= 31) return true;
	}
	if (value.startsWith("fc") || value.startsWith("fd")) return true;
	if (value.startsWith("fe80:")) return true;
	return false;
}
