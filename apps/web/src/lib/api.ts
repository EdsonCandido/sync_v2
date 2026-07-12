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
	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
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
