export const APP_VERSION =
	String(import.meta.env.VITE_APP_VERSION ?? "").trim() || "dev";

type VersionPayload = {
	version: string;
};

function isVersionPayload(value: unknown): value is VersionPayload {
	return (
		typeof value === "object" &&
		value !== null &&
		"version" in value &&
		typeof value.version === "string"
	);
}

export async function fetchRemoteAppVersion(): Promise<string | null> {
	try {
		const response = await fetch("/version.json", { cache: "no-store" });
		if (!response.ok) return null;
		const data: unknown = await response.json();
		if (!isVersionPayload(data)) return null;
		return data.version;
	} catch {
		return null;
	}
}
