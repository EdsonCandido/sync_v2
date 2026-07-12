import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";
import { InsightCard } from "./InsightCard";

type InsightsPanelProps = {
	insights: CompanyDashboard["insights"];
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
	return (
		<Box>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Insights automáticos
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={5}>
				Sinais derivados dos dados da empresa
			</Text>

			{insights.length === 0 ? (
				<Box
					p={8}
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border"
					borderRadius="2xl"
					textAlign="center"
				>
					<Text color="fg.muted">Sem insights no momento.</Text>
				</Box>
			) : (
				<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
					{insights.map((insight) => (
						<InsightCard key={insight.id} insight={insight} />
					))}
				</SimpleGrid>
			)}
		</Box>
	);
}
