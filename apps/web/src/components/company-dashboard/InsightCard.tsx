import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import {
	LuCircleAlert,
	LuInfo,
	LuSparkles,
	LuTriangleAlert,
} from "react-icons/lu";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

type InsightCardProps = {
	insight: CompanyDashboard["insights"][number];
};

const TONE_META = {
	positive: {
		icon: LuSparkles,
		bg: "green.subtle",
		fg: "green.fg",
		border: "green.emphasized",
	},
	warning: {
		icon: LuTriangleAlert,
		bg: "orange.subtle",
		fg: "orange.fg",
		border: "orange.emphasized",
	},
	neutral: {
		icon: LuCircleAlert,
		bg: "bg.muted",
		fg: "fg.muted",
		border: "border",
	},
	info: {
		icon: LuInfo,
		bg: "helios.subtle",
		fg: "helios.fg",
		border: "helios.border",
	},
} as const;

export function InsightCard({ insight }: InsightCardProps) {
	const meta = TONE_META[insight.tone];

	return (
		<Flex
			align="flex-start"
			gap={4}
			p={5}
			bg={meta.bg}
			borderWidth="1px"
			borderColor={meta.border}
			borderRadius="2xl"
			minH="28"
		>
			<Flex
				align="center"
				justify="center"
				w="10"
				h="10"
				flexShrink={0}
				borderRadius="xl"
				bg="bg.panel"
				color={meta.fg}
			>
				<Icon as={meta.icon} boxSize={5} />
			</Flex>
			<Text
				fontSize={{ base: "md", md: "lg" }}
				fontWeight="700"
				fontFamily="heading"
				letterSpacing="-0.02em"
				lineHeight="short"
				color="fg"
			>
				{insight.message}
			</Text>
		</Flex>
	);
}
