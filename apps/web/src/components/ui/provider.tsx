"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

/** Paleta alinhada a https://helioslabs.com.br/ (helios-gold + slate) */
const system = createSystem(defaultConfig, {
	theme: {
		tokens: {
			fonts: {
				heading: { value: `"Outfit", sans-serif` },
				body: { value: `"Source Sans 3", sans-serif` },
			},
			colors: {
				helios: {
					50: { value: "#FFFBEB" },
					100: { value: "#FEF3C7" },
					200: { value: "#FDE68A" },
					300: { value: "#FCD34D" },
					400: { value: "#FACC15" },
					500: { value: "#EAB308" },
					600: { value: "#CA8A04" },
					700: { value: "#A16207" },
					800: { value: "#854D0E" },
					900: { value: "#713F12" },
					950: { value: "#422006" },
				},
			},
		},
		semanticTokens: {
			colors: {
				"helios.solid": {
					value: {
						_light: "{colors.helios.500}",
						_dark: "{colors.helios.400}",
					},
				},
				"helios.contrast": {
					value: {
						_light: "{colors.gray.950}",
						_dark: "{colors.gray.950}",
					},
				},
				"helios.fg": {
					value: {
						_light: "{colors.helios.700}",
						_dark: "{colors.helios.400}",
					},
				},
				"helios.muted": {
					value: {
						_light: "{colors.helios.100}",
						_dark: "rgba(250, 204, 21, 0.12)",
					},
				},
				"helios.subtle": {
					value: {
						_light: "{colors.helios.50}",
						_dark: "rgba(250, 204, 21, 0.08)",
					},
				},
				"helios.emphasized": {
					value: {
						_light: "{colors.helios.200}",
						_dark: "rgba(250, 204, 21, 0.2)",
					},
				},
				"helios.focusRing": {
					value: {
						_light: "{colors.helios.500}",
						_dark: "{colors.helios.400}",
					},
				},
				"helios.border": {
					value: {
						_light: "rgba(202, 138, 4, 0.35)",
						_dark: "rgba(250, 204, 21, 0.3)",
					},
				},
				"dash.sidebar": {
					value: {
						_light: "rgba(255, 255, 255, 0.82)",
						_dark: "rgba(15, 23, 42, 0.85)",
					},
				},
				"dash.navbar": {
					value: {
						_light: "rgba(255, 255, 255, 0.78)",
						_dark: "rgba(2, 6, 23, 0.72)",
					},
				},
			},
		},
	},
});

export function Provider(props: ColorModeProviderProps) {
	const { children, ...rest } = props;

	return (
		<ChakraProvider value={system}>
			<ColorModeProvider {...rest}>{children}</ColorModeProvider>
		</ChakraProvider>
	);
}
