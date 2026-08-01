import { Box, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";

function CardSkeleton({ h = "140px" }: { h?: string }) {
	return (
		<Box
			p={6}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
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

export function HeliosSkeleton() {
	return (
		<Stack gap={8}>
			<SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={5}>
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
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

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
	return (
		<Stack gap={4} align="center" py={16} role="status" aria-live="polite">
			<Box
				w="10"
				h="10"
				rounded="full"
				borderWidth="2px"
				borderColor="helios.border"
				borderTopColor="helios.solid"
				animation="spin 0.8s linear infinite"
				css={{
					"@keyframes spin": {
						to: { transform: "rotate(360deg)" },
					},
				}}
			/>
			<Box as="span" fontSize="sm" color="fg.muted">
				{label}
			</Box>
		</Stack>
	);
}
