import { Box } from "@chakra-ui/react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { useEffect, useRef } from "react";

type CompanyMapProps = {
	latitude: number;
	longitude: number;
	label?: string;
};

export function CompanyMap({ latitude, longitude, label }: CompanyMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<LeafletMap | null>(null);
	const markerRef = useRef<LeafletMarker | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		let cancelled = false;

		void (async () => {
			const L = (await import("leaflet")).default;
			await import("leaflet/dist/leaflet.css");

			const [
				{ default: iconUrl },
				{ default: iconRetinaUrl },
				{ default: shadowUrl },
			] = await Promise.all([
				import("leaflet/dist/images/marker-icon.png"),
				import("leaflet/dist/images/marker-icon-2x.png"),
				import("leaflet/dist/images/marker-shadow.png"),
			]);

			if (cancelled || !containerRef.current) return;

			const markerIcon = L.icon({
				iconUrl,
				iconRetinaUrl,
				shadowUrl,
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41],
			});

			if (!mapRef.current) {
				mapRef.current = L.map(containerRef.current).setView(
					[latitude, longitude],
					16,
				);
				L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				}).addTo(mapRef.current);
				markerRef.current = L.marker([latitude, longitude], {
					icon: markerIcon,
				}).addTo(mapRef.current);
				if (label) markerRef.current.bindPopup(label);
			} else {
				mapRef.current.setView([latitude, longitude], 16);
				markerRef.current?.setIcon(markerIcon);
				markerRef.current?.setLatLng([latitude, longitude]);
				if (label) markerRef.current?.bindPopup(label);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [latitude, longitude, label]);

	useEffect(() => {
		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
			markerRef.current = null;
		};
	}, []);

	return (
		<Box
			ref={containerRef}
			h={{ base: "240px", md: "320px" }}
			w="full"
			rounded="md"
			overflow="hidden"
			borderWidth="1px"
			borderColor="helios.border"
			zIndex={0}
		/>
	);
}
