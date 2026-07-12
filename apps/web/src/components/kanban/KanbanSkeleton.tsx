import { Box, Grid, HStack, Skeleton, Stack } from "@chakra-ui/react";

const KPI_KEYS = ["k1", "k2", "k3", "k4", "k5"] as const;
const COL_KEYS = ["c1", "c2", "c3", "c4"] as const;

export function KanbanSkeleton() {
	return (
		<Stack gap={4}>
			<Skeleton height="72px" borderRadius="2xl" />
			<Grid
				templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
				gap={3}
			>
				{KPI_KEYS.map((key) => (
					<Skeleton key={key} height="84px" borderRadius="xl" />
				))}
			</Grid>
			<HStack align="start" gap={4} overflow="hidden">
				{COL_KEYS.map((key) => (
					<Box key={key} minW="300px">
						<Skeleton height="420px" borderRadius="2xl" />
					</Box>
				))}
			</HStack>
		</Stack>
	);
}
