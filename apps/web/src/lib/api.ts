import { env } from "@sync_v2/env/web";

function getServerUrl(url: string) {
	const normalized = url.endsWith("/") ? url.slice(0, -1) : url;

	if (!normalized.startsWith("/")) {
		return normalized;
	}

	if (typeof window !== "undefined") {
		return `${window.location.origin}${normalized}`;
	}

	return `http://localhost:3000${normalized}`;
}

const API_BASE = getServerUrl(env.VITE_SERVER_URL);

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const isFormData =
		typeof FormData !== "undefined" && init?.body instanceof FormData;
	const headers = new Headers(init?.headers);
	if (!isFormData && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		credentials: "include",
		headers,
	});

	if (!response.ok) {
		let message = response.statusText || "Erro na requisição";
		try {
			const body = (await response.json()) as { message?: string };
			if (body.message) message = body.message;
		} catch {
			// ignore
		}
		throw new ApiError(response.status, message);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export async function apiFetchBlob(
	path: string,
	init?: RequestInit,
): Promise<{ blob: Blob; filename: string | null }> {
	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		credentials: "include",
	});

	if (!response.ok) {
		let message = response.statusText || "Erro na requisição";
		try {
			const body = (await response.json()) as { message?: string };
			if (body.message) message = body.message;
		} catch {
			// ignore
		}
		throw new ApiError(response.status, message);
	}

	const disposition = response.headers.get("Content-Disposition");
	let filename: string | null = null;
	if (disposition) {
		const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
		const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
		if (utf8Match?.[1]) {
			filename = decodeURIComponent(utf8Match[1]);
		} else if (plainMatch?.[1]) {
			filename = plainMatch[1];
		}
	}

	return { blob: await response.blob(), filename };
}
