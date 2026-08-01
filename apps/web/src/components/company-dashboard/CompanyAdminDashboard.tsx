import { Box, SimpleGrid, Stack } from "@chakra-ui/react";

import { PageHeader } from "@/components/ui/PageHeader";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

import { DepartmentPieChart } from "./DepartmentPieChart";
import { InsightsPanel } from "./InsightsPanel";
import { KpiGrid } from "./KpiGrid";
import { WidgetGrid } from "./mocks/WidgetGrid";
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
		<Box maxW="7xl" mx="auto">
			<Stack gap={8}>
				<PageHeader
					eyebrow="Visão geral"
					title={userName ? `Olá, ${userName}.` : "Dashboard"}
					description="Panorama da sua empresa em tempo quase real."
				/>

				<KpiGrid kpis={data.kpis} />

				<SimpleGrid columns={{ base: 1, lg: 5 }} gap={5}>
					<Box gridColumn={{ lg: "span 3" }}>
						<UsageTrendChart data={data.usageTrend} />
					</Box>
					<Box gridColumn={{ lg: "span 2" }}>
						<DepartmentPieChart data={data.departmentDistribution} />
					</Box>
				</SimpleGrid>

				<SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
					<RecentActivityTable activities={data.recentActivities} />
					<PendenciesList pendencies={data.pendencies} />
				</SimpleGrid>

				<InsightsPanel insights={data.insights} />

				<QuickActions />

				<WidgetGrid />
			</Stack>
		</Box>
	);
}
