import type { GeocodeRequest, GeocodeResponse } from "@sync_v2/contracts";
import { AppError } from "../utils/AppError";

const NOMINATIM_TIMEOUT_MS = 10_000;
const NOMINATIM_USER_AGENT = "sync_v2/1.0 (empresas-geocode)";

export class GeocodeAddressService {
	async execute(input: GeocodeRequest): Promise<GeocodeResponse> {
		const query = [
			input.street,
			input.number,
			input.district,
			input.city,
			input.state,
			input.zipCode,
			"Brasil",
		]
			.filter(Boolean)
			.join(", ");

		const url = new URL("https://nominatim.openstreetmap.org/search");
		url.searchParams.set("q", query);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "1");
		url.searchParams.set("countrycodes", "br");

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

		try {
			const response = await fetch(url.toString(), {
				signal: controller.signal,
				headers: {
					"User-Agent": NOMINATIM_USER_AGENT,
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new AppError(502, "Erro ao obter coordenadas.");
			}

			const data = (await response.json()) as Array<{
				lat: string;
				lon: string;
			}>;

			const first = data[0];
			if (!first) {
				throw new AppError(404, "Endereço não encontrado para geocoding.");
			}

			return {
				latitude: Number(first.lat),
				longitude: Number(first.lon),
			};
		} catch (error) {
			if (error instanceof AppError) throw error;
			if (error instanceof Error && error.name === "AbortError") {
				throw new AppError(504, "Timeout ao obter coordenadas.");
			}
			throw new AppError(502, "Erro ao obter coordenadas.");
		} finally {
			clearTimeout(timer);
		}
	}
}
