import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router";

type BrandMarkProps = {
	size?: "sm" | "md" | "lg";
	showTagline?: boolean;
	to?: string;
};

const SIZE = {
	sm: { mark: "7", title: "md", gap: 2 },
	md: { mark: "9", title: "lg", gap: 3 },
	lg: { mark: "12", title: "2xl", gap: 4 },
} as const;

export function BrandMark({
	size = "md",
	showTagline = true,
	to = "/",
}: BrandMarkProps) {
	const s = SIZE[size];

	const content = (
		<Flex align="center" gap={s.gap}>
			<Box
				w={s.mark}
				h={s.mark}
				rounded="lg"
				flexShrink={0}
				bgGradient="to-br"
				gradientFrom="helios.400"
				gradientVia="helios.300"
				gradientTo="helios.200"
				shadow="solarGlowSoft"
				position="relative"
				aria-hidden
			>
				<Box
					position="absolute"
					inset="22%"
					rounded="full"
					bg="helios.50"
					opacity={0.85}
				/>
			</Box>
			<Box>
				<Text
					fontFamily="heading"
					fontWeight="800"
					fontSize={s.title}
					letterSpacing="-0.03em"
					lineHeight="1.1"
					color="fg"
				>
					Helios Labs
				</Text>
				{showTagline && (
					<Text
						fontSize="xs"
						color="helios.fg"
						fontWeight="500"
						letterSpacing="0.04em"
					>
						CRM powered by light
					</Text>
				)}
			</Box>
		</Flex>
	);

	if (to) {
		return (
			<Link to={to} style={{ textDecoration: "none" }}>
				{content}
			</Link>
		);
	}

	return content;
}
