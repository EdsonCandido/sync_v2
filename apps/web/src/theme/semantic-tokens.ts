import { defineSemanticTokens } from "@chakra-ui/react";

export const semanticColorTokens = defineSemanticTokens.colors({
	"helios.solid": {
		value: {
			_light: "{colors.helios.400}",
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
			_dark: "{colors.helios.300}",
		},
	},
	"helios.muted": {
		value: {
			_light: "{colors.helios.100}",
			_dark: "rgba(253, 184, 19, 0.12)",
		},
	},
	"helios.subtle": {
		value: {
			_light: "{colors.helios.50}",
			_dark: "rgba(253, 184, 19, 0.08)",
		},
	},
	"helios.emphasized": {
		value: {
			_light: "{colors.helios.200}",
			_dark: "rgba(253, 184, 19, 0.22)",
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
			_light: "rgba(204, 110, 0, 0.35)",
			_dark: "rgba(253, 184, 19, 0.28)",
		},
	},
	"dash.sidebar": {
		value: {
			_light: "rgba(250, 250, 250, 0.88)",
			_dark: "rgba(15, 17, 23, 0.88)",
		},
	},
	"dash.navbar": {
		value: {
			_light: "rgba(250, 250, 250, 0.82)",
			_dark: "rgba(15, 17, 23, 0.78)",
		},
	},
	"helios.panel": {
		value: {
			_light: "{colors.white}",
			_dark: "{colors.surface.cardDark}",
		},
	},
	"helios.canvas": {
		value: {
			_light: "{colors.surface.light}",
			_dark: "{colors.surface.dark}",
		},
	},
});
