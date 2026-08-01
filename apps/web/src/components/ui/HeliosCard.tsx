import { Box, type BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

type HeliosCardProps = BoxProps & {
	children: ReactNode;
	interactive?: boolean;
	glow?: boolean;
};

export function HeliosCard({
	children,
	interactive = false,
	glow = false,
	...rest
}: HeliosCardProps) {
	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
			shadow="heliosSm"
			transition="transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease, border-color 0.2s ease"
			_hover={
				interactive
					? {
							borderColor: "helios.border",
							transform: "translateY(-3px)",
							shadow: glow ? "solarGlowSoft" : "heliosMd",
						}
					: undefined
			}
			{...rest}
		>
			{children}
		</Box>
	);
}
