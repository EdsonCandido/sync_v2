import { defineTokens } from "@chakra-ui/react";

export const shadowTokens = defineTokens.shadows({
	heliosSm: {
		value: "0 1px 2px rgba(15, 17, 23, 0.06), 0 0 0 1px rgba(15, 17, 23, 0.04)",
	},
	heliosMd: {
		value:
			"0 8px 24px rgba(15, 17, 23, 0.12), 0 0 0 1px rgba(253, 184, 19, 0.08)",
	},
	heliosLg: {
		value:
			"0 16px 48px rgba(15, 17, 23, 0.18), 0 0 0 1px rgba(253, 184, 19, 0.1)",
	},
	solarGlow: {
		value:
			"0 0 32px rgba(253, 184, 19, 0.35), 0 0 64px rgba(255, 138, 0, 0.15)",
	},
	solarGlowSoft: {
		value: "0 0 24px rgba(253, 184, 19, 0.2)",
	},
});
