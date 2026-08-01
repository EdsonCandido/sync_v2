import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

import { semanticColorTokens } from "./semantic-tokens";
import { colorTokens } from "./tokens/colors";
import { fontTokens } from "./tokens/fonts";
import { durationTokens, easingTokens } from "./tokens/motion";
import { radiusTokens } from "./tokens/radii";
import { shadowTokens } from "./tokens/shadows";

const heliosConfig = defineConfig({
	theme: {
		tokens: {
			colors: colorTokens,
			fonts: fontTokens,
			radii: radiusTokens,
			shadows: shadowTokens,
			durations: durationTokens,
			easings: easingTokens,
		},
		semanticTokens: {
			colors: semanticColorTokens,
		},
	},
});

export const system = createSystem(defaultConfig, heliosConfig);
