import { Box, Grid, Text } from "@chakra-ui/react";
import { memo } from "react";

export type KanbanStats = {
	total: number;
	inProgress: number;
	done: number;
	overdue: number;
	mine: number;
};

type KanbanStatisticsProps = {
	stats: KanbanStats;
};

function StatCard({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: string;
}) {
	return (
		<Box
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="xl"
			p={3}
			position="relative"
			overflow="hidden"
		>
			<Box
				position="absolute"
				insetStart={0}
				top={0}
				bottom={0}
				w="3px"
				bg={tone}
			/>
			<Text fontSize="xs" color="fg.muted" fontWeight="500">
				{label}
			</Text>
			<Text fontSize="2xl" fontWeight="700" mt={1} letterSpacing="-0.02em">
				{value}
			</Text>
		</Box>
	);
}

export const KanbanStatistics = memo(function KanbanStatistics({
	stats,
}: KanbanStatisticsProps) {
	return (
		<Grid
			templateColumns={{
				base: "repeat(2, 1fr)",
				md: "repeat(3, 1fr)",
				lg: "repeat(5, 1fr)",
			}}
			gap={3}
		>
			<StatCard label="Total" value={stats.total} tone="helios.solid" />
			<StatCard
				label="Em andamento"
				value={stats.inProgress}
				tone="orange.solid"
			/>
			<StatCard label="Concluídas" value={stats.done} tone="green.solid" />
			<StatCard label="Atrasadas" value={stats.overdue} tone="red.solid" />
			<StatCard label="Minhas tarefas" value={stats.mine} tone="blue.solid" />
		</Grid>
	);
});
