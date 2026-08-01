import { Box, Stack, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { CompanyAdminDashboard } from "@/components/company-dashboard/CompanyAdminDashboard";
import { DashboardEmptyState } from "@/components/company-dashboard/DashboardEmptyState";
import { DashboardErrorState } from "@/components/company-dashboard/DashboardErrorState";
import { DashboardSkeleton } from "@/components/company-dashboard/DashboardSkeleton";
import {
	MockAlertsWidget,
	MockFavoritesWidget,
	MockGoalsWidget,
} from "@/components/company-dashboard/mocks/MockWidgets";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type CompanyDashboard,
	fetchCompanyDashboard,
} from "@/lib/company-dashboard-api";

function WelcomeHome({ name }: { name: string }) {
	return (
		<Box maxW="7xl" mx="auto">
			<Stack gap={8}>
				<PageHeader
					eyebrow="Bem-vindo"
					title={name ? `Olá, ${name}.` : "Olá."}
					description="Selecione um módulo no menu lateral para começar."
				/>
				<Box
					display="grid"
					gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
					gap={4}
				>
					<MockFavoritesWidget />
					<MockGoalsWidget />
					<MockAlertsWidget />
				</Box>
				<Text fontSize="sm" color="fg.muted">
					Widgets acimaativos — preview da experiência Helios Labs.
				</Text>
			</Stack>
		</Box>
	);
}

export default function DashboardHome() {
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const name = session?.user.name ?? "";
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;

	const [data, setData] = useState<CompanyDashboard | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchCompanyDashboard();
			setData(result);
		} catch (err) {
			setData(null);
			setError(
				err instanceof ApiError ? err.message : "Erro ao carregar o dashboard.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (sessionPending) return;
		if (perfil === "admin_empresa") {
			void load();
		}
	}, [perfil, sessionPending, load]);

	if (sessionPending) {
		return <DashboardSkeleton />;
	}

	if (perfil !== "admin_empresa") {
		return <WelcomeHome name={name} />;
	}

	if (loading && !data) {
		return <DashboardSkeleton />;
	}

	if (error) {
		return <DashboardErrorState message={error} onRetry={() => void load()} />;
	}

	if (!data) {
		return <DashboardEmptyState onRetry={() => void load()} />;
	}

	const isEmpty =
		data.kpis.every(
			(kpi) => kpi.value === 0 || kpi.value === "0" || kpi.value === "+0%",
		) &&
		data.recentActivities.length === 0 &&
		data.pendencies.length === 0;

	if (isEmpty) {
		return <DashboardEmptyState onRetry={() => void load()} />;
	}

	return <CompanyAdminDashboard data={data} userName={name} />;
}
