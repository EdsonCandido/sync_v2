import { Box, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";
import { DepartmentPieChart } from "./DepartmentPieChart";
import { InsightsPanel } from "./InsightsPanel";
import { KpiGrid } from "./KpiGrid";
import { PendenciesList } from "./PendenciesList";
import { QuickActions } from "./QuickActions";
import { RecentActivityTable } from "./RecentActivityTable";
import { UsageTrendChart } from "./UsageTrendChart";

type CompanyAdminDashboardProps = {
	data: CompanyDashboard;
	userName?: string;
};

export function CompanyAdminDashboard({
	data,
	userName,
}: CompanyAdminDashboardProps) {
	return (
		<Box
			maxW="7xl"
			mx="auto"
			animation="fade-in 0.45s ease-out"
			css={{
				"@keyframes fade-in": {
					from: { opacity: 0, transform: "translateY(8px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
			}}
		>
			<Stack gap={8}>
				<Box>
					<Text
						fontSize="sm"
						fontWeight="600"
						color="helios.fg"
						letterSpacing="0.06em"
						textTransform="uppercase"
						mb={2}
					>
						Visão geral
					</Text>
					<Heading
						as="h1"
						size="2xl"
						fontFamily="heading"
						fontWeight="800"
						letterSpacing="-0.03em"
						lineHeight="1.15"
					>
						{userName ? `Olá, ${userName}.` : "Dashboard"}
					</Heading>
					<Text mt={2} color="fg.muted" maxW="xl">
						Panorama da sua empresa em tempo quase real.
					</Text>
				</Box>

				<KpiGrid kpis={data.kpis} />

				<SimpleGrid columns={{ base: 1, lg: 5 }} gap={5}>
					<Box gridColumn={{ lg: "span 3" }}>
						<UsageTrendChart data={data.usageTrend} />
					</Box>
					<Box gridColumn={{ lg: "span 2" }}>
						<DepartmentPieChart data={data.departmentDistribution} />
					</Box>
				</SimpleGrid>

				<RecentActivityTable activities={data.recentActivities} />

				<PendenciesList pendencies={data.pendencies} />

				<InsightsPanel insights={data.insights} />

				<QuickActions />
			</Stack>
		</Box>
	);
}
