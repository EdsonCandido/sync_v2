import { defineTokens } from "@chakra-ui/react";

export const durationTokens = defineTokens.durations({
	heliosFast: { value: "120ms" },
	helios: { value: "200ms" },
	heliosSlow: { value: "420ms" },
});

export const easingTokens = defineTokens.easings({
	helios: { value: "cubic-bezier(0.22, 1, 0.36, 1)" },
});
