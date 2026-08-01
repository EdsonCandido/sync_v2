import { defineTokens } from "@chakra-ui/react";

/** Primária #FDB813 · secundária #FF8A00 · accent #FFE082 */
export const colorTokens = defineTokens.colors({
	helios: {
		50: { value: "#FFF9E6" },
		100: { value: "#FFF0C2" },
		200: { value: "#FFE082" },
		300: { value: "#FFD54F" },
		400: { value: "#FDB813" },
		500: { value: "#F5A623" },
		600: { value: "#FF8A00" },
		700: { value: "#CC6E00" },
		800: { value: "#995200" },
		900: { value: "#663700" },
		950: { value: "#331C00" },
	},
	solar: {
		secondary: { value: "#FF8A00" },
		accent: { value: "#FFE082" },
		glow: { value: "rgba(253, 184, 19, 0.35)" },
	},
	surface: {
		light: { value: "#FAFAFA" },
		dark: { value: "#0F1117" },
		cardDark: { value: "#181B22" },
	},
	status: {
		success: { value: "#22C55E" },
		error: { value: "#EF4444" },
		info: { value: "#3B82F6" },
		warning: { value: "#F59E0B" },
	},
});
