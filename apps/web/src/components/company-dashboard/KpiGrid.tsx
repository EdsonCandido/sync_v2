import { SimpleGrid } from "@chakra-ui/react";
import {
	LuBadgePercent,
	LuCalendarClock,
	LuClipboardList,
	LuGem,
	LuUserCheck,
	LuUsers,
} from "react-icons/lu";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";
import { KpiCard } from "./KpiCard";

const KPI_ICONS = {
	active_users: LuUserCheck,
	registered_users: LuUsers,
	pending_requests: LuClipboardList,
	plan: LuGem,
	days_to_expiry: LuCalendarClock,
	growth: LuBadgePercent,
} as const;

type KpiGridProps = {
	kpis: CompanyDashboard["kpis"];
	onKpiClick?: (kpiId: string) => void;
};

export function KpiGrid({ kpis, onKpiClick }: KpiGridProps) {
	return (
		<SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={{ base: 4, md: 5 }}>
			{kpis.map((kpi) => (
				<KpiCard
					key={kpi.id}
					icon={KPI_ICONS[kpi.id as keyof typeof KPI_ICONS] ?? LuUsers}
					label={kpi.label}
					value={kpi.value}
					description={kpi.description}
					deltaPercent={kpi.deltaPercent}
					trend={kpi.trend}
					onClick={onKpiClick ? () => onKpiClick(kpi.id) : undefined}
				/>
			))}
		</SimpleGrid>
	);
}
