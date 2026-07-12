import { Box, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";

function CardSkeleton({ h = "140px" }: { h?: string }) {
	return (
		<Box
			p={6}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
		>
			<Stack gap={3}>
				<Skeleton h="10" w="10" borderRadius="xl" />
				<Skeleton h="4" w="40%" />
				<Skeleton h="8" w="60%" />
				<Skeleton h="3" w="70%" />
			</Stack>
			{h !== "140px" && <Skeleton mt={6} h={h} borderRadius="lg" />}
		</Box>
	);
}

export function DashboardSkeleton() {
	return (
		<Stack gap={8}>
			<SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={5}>
				{Array.from({ length: 6 }).map((_, i) => (
					<CardSkeleton key={i} />
				))}
			</SimpleGrid>
			<SimpleGrid columns={{ base: 1, lg: 5 }} gap={5}>
				<Box gridColumn={{ lg: "span 3" }}>
					<CardSkeleton h="220px" />
				</Box>
				<Box gridColumn={{ lg: "span 2" }}>
					<CardSkeleton h="220px" />
				</Box>
			</SimpleGrid>
			<CardSkeleton h="160px" />
			<CardSkeleton h="120px" />
		</Stack>
	);
}
