import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

export type KpiCardProps = {
	icon: IconType;
	label: string;
	value: string | number;
	description: string;
	deltaPercent: number | null;
	trend: "up" | "down" | "neutral";
	onClick?: () => void;
};

export function KpiCard({
	icon,
	label,
	value,
	description,
	deltaPercent,
	trend,
	onClick,
}: KpiCardProps) {
	const trendColor =
		trend === "up" ? "green.fg" : trend === "down" ? "red.fg" : "fg.muted";

	return (
		<Box
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			textAlign="left"
			w="full"
			p={{ base: 5, md: 6 }}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
			cursor={onClick ? "pointer" : "default"}
			transition="all 0.2s ease"
			_hover={
				onClick
					? {
							borderColor: "helios.border",
							transform: "translateY(-2px)",
							shadow: "md",
						}
					: undefined
			}
			onClick={onClick}
			onKeyDown={(event) => {
				if (!onClick) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onClick();
				}
			}}
		>
			<Flex align="center" justify="space-between" mb={4}>
				<Flex
					align="center"
					justify="center"
					w="10"
					h="10"
					borderRadius="xl"
					bg="helios.subtle"
					color="helios.fg"
				>
					<Icon as={icon} boxSize={5} />
				</Flex>
				{deltaPercent != null && (
					<Flex
						align="center"
						gap={1}
						color={trendColor}
						fontSize="sm"
						fontWeight="600"
					>
						{trend === "up" && <Icon as={LuTrendingUp} />}
						{trend === "down" && <Icon as={LuTrendingDown} />}
						<Text>
							{deltaPercent > 0 ? "+" : ""}
							{deltaPercent}%
						</Text>
					</Flex>
				)}
			</Flex>
			<Text fontSize="sm" color="fg.muted" fontWeight="500" mb={1}>
				{label}
			</Text>
			<Text
				fontSize={{ base: "2xl", md: "3xl" }}
				fontWeight="800"
				fontFamily="heading"
				letterSpacing="-0.03em"
				color="fg"
				lineHeight="1.1"
			>
				{value}
			</Text>
			<Text mt={2} fontSize="sm" color="fg.muted">
				{description}
			</Text>
		</Box>
	);
}
