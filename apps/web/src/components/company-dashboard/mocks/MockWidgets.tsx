import {
	Badge,
	Box,
	Flex,
	Heading,
	HStack,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Link } from "react-router";

import { HeliosCard } from "@/components/ui/HeliosCard";

import {
	MOCK_ALERTS,
	MOCK_CALENDAR_EVENTS,
	MOCK_FAVORITES,
	MOCK_FINANCE,
	MOCK_GOALS,
	MOCK_TIMELINE,
} from "./mock-data";

function DemoBadge() {
	return (
		<Badge
			flexShrink={0}
			bg="helios.subtle"
			color="helios.fg"
			fontSize="2xs"
			textTransform="uppercase"
			letterSpacing="0.08em"
			fontWeight="700"
			borderWidth="1px"
			borderColor="helios.border"
		>
			demo
		</Badge>
	);
}

function WidgetHeader({ title }: { title: string }) {
	return (
		<HStack justify="space-between" mb={4}>
			<Heading as="h3" size="sm" fontFamily="heading" fontWeight="700">
				{title}
			</Heading>
			<DemoBadge />
		</HStack>
	);
}

export function MockCalendarWidget() {
	return (
		<HeliosCard h="full">
			<WidgetHeader title="Calendário" />
			<SimpleGrid columns={7} gap={1} mb={4}>
				{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
					<Text
						key={d}
						fontSize="2xs"
						color="fg.muted"
						textAlign="center"
						fontWeight="600"
					>
						{d.charAt(0)}
					</Text>
				))}
				{Array.from({ length: 7 }, (_, i) => {
					const day = i + 1;
					const hasEvent = MOCK_CALENDAR_EVENTS.some((e) => e.day === day);
					return (
						<Flex
							key={`day-${day}`}
							align="center"
							justify="center"
							h="8"
							rounded="md"
							fontSize="xs"
							fontWeight={hasEvent ? "700" : "500"}
							bg={hasEvent ? "helios.subtle" : "transparent"}
							color={hasEvent ? "helios.fg" : "fg"}
							borderWidth={hasEvent ? "1px" : "0"}
							borderColor="helios.border"
						>
							{day}
						</Flex>
					);
				})}
			</SimpleGrid>
			<VStack align="stretch" gap={2}>
				{MOCK_CALENDAR_EVENTS.slice(0, 3).map((e) => (
					<HStack key={e.label} justify="space-between" fontSize="sm">
						<Text truncate>{e.label}</Text>
						<Text color="fg.muted" flexShrink={0}>
							{e.time}
						</Text>
					</HStack>
				))}
			</VStack>
		</HeliosCard>
	);
}

export function MockTimelineWidget() {
	const toneColor = {
		info: "blue.fg",
		success: "green.fg",
		warning: "orange.fg",
		error: "red.fg",
	} as const;

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Timeline" />
			<VStack align="stretch" gap={0} position="relative" ps={4}>
				<Box
					position="absolute"
					left="1"
					top={1}
					bottom={1}
					w="1px"
					bg="border"
				/>
				{MOCK_TIMELINE.map((item) => (
					<Box key={item.id} position="relative" pb={4}>
						<Box
							position="absolute"
							left="-3.5"
							top="1"
							w="2.5"
							h="2.5"
							rounded="full"
							bg="helios.panel"
							borderWidth="2px"
							borderColor={toneColor[item.tone]}
						/>
						<Text fontSize="sm" fontWeight="600">
							{item.title}
						</Text>
						<Text fontSize="xs" color="fg.muted">
							{item.meta}
						</Text>
					</Box>
				))}
			</VStack>
		</HeliosCard>
	);
}

export function MockFavoritesWidget() {
	return (
		<HeliosCard h="full">
			<WidgetHeader title="Favoritos" />
			<SimpleGrid columns={2} gap={2}>
				{MOCK_FAVORITES.map((f) => (
					<Link key={f.id} to={f.path} style={{ textDecoration: "none" }}>
						<Box
							p={3}
							rounded="xl"
							borderWidth="1px"
							borderColor="border"
							bg="bg.subtle"
							_hover={{ borderColor: "helios.border", bg: "helios.subtle" }}
							transition="all 0.15s ease"
						>
							<Text fontSize="sm" fontWeight="600" color="fg">
								{f.label}
							</Text>
						</Box>
					</Link>
				))}
			</SimpleGrid>
		</HeliosCard>
	);
}

export function MockGoalsWidget() {
	return (
		<HeliosCard h="full">
			<WidgetHeader title="Metas" />
			<VStack align="stretch" gap={4}>
				{MOCK_GOALS.map((g) => (
					<Stack key={g.id} gap={1.5}>
						<HStack justify="space-between">
							<Text fontSize="sm" fontWeight="600">
								{g.label}
							</Text>
							<Text fontSize="xs" color="fg.muted">
								{g.target}
							</Text>
						</HStack>
						<Progress.Root value={g.progress} size="sm" colorPalette="helios">
							<Progress.Track>
								<Progress.Range />
							</Progress.Track>
						</Progress.Root>
					</Stack>
				))}
			</VStack>
		</HeliosCard>
	);
}

export function MockFinanceSummary() {
	return (
		<HeliosCard h="full" glow>
			<WidgetHeader title="Resumo financeiro" />
			<SimpleGrid columns={2} gap={3}>
				{(
					[
						["A receber", MOCK_FINANCE.receber],
						["A pagar", MOCK_FINANCE.pagar],
						["Saldo", MOCK_FINANCE.saldo],
						["Tendência", MOCK_FINANCE.trend],
					] as const
				).map(([label, value]) => (
					<Box
						key={label}
						p={3}
						rounded="xl"
						bg="bg.subtle"
						borderWidth="1px"
						borderColor="border"
					>
						<Text fontSize="xs" color="fg.muted">
							{label}
						</Text>
						<Text
							fontFamily="heading"
							fontWeight="800"
							fontSize="lg"
							color={label === "Tendência" ? "helios.fg" : "fg"}
						>
							{value}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</HeliosCard>
	);
}

export function MockAlertsWidget() {
	const levelColor = {
		warning: "orange",
		info: "blue",
		error: "red",
	} as const;

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Alertas" />
			<VStack align="stretch" gap={2}>
				{MOCK_ALERTS.map((a) => (
					<HStack
						key={a.id}
						p={3}
						rounded="xl"
						borderWidth="1px"
						borderColor="border"
						bg="bg.subtle"
						gap={3}
					>
						<Badge colorPalette={levelColor[a.level]} variant="subtle">
							{a.level}
						</Badge>
						<Text fontSize="sm" lineHeight="short">
							{a.title}
						</Text>
					</HStack>
				))}
			</VStack>
		</HeliosCard>
	);
}
