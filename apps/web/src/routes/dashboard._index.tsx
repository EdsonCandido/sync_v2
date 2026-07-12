import { Box, Heading, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { CompanyAdminDashboard } from "@/components/company-dashboard/CompanyAdminDashboard";
import { DashboardEmptyState } from "@/components/company-dashboard/DashboardEmptyState";
import { DashboardErrorState } from "@/components/company-dashboard/DashboardErrorState";
import { DashboardSkeleton } from "@/components/company-dashboard/DashboardSkeleton";
import { authClient } from "@/lib/auth-client";
import {
	type CompanyDashboard,
	fetchCompanyDashboard,
} from "@/lib/company-dashboard-api";
import { ApiError } from "@/lib/api";

function WelcomeHome({ name }: { name: string }) {
	return (
		<Box
			maxW="2xl"
			animation="fade-in 0.5s ease-out"
			css={{
				"@keyframes fade-in": {
					from: { opacity: 0, transform: "translateY(8px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
			}}
		>
			<Text
				fontSize="sm"
				fontWeight="600"
				color="helios.fg"
				letterSpacing="0.06em"
				textTransform="uppercase"
				mb={3}
			>
				Bem-vindo
			</Text>
			<Heading
				as="h1"
				size="2xl"
				fontFamily="heading"
				fontWeight="800"
				letterSpacing="-0.03em"
				lineHeight="1.15"
				color="fg"
			>
				{name ? `Olá, ${name}.` : "Olá."}
			</Heading>
			<Text mt={4} fontSize="lg" color="fg.muted" maxW="lg" lineHeight="tall">
				Selecione um módulo no menu lateral para começar.
			</Text>
			<Box
				mt={8}
				h="1px"
				w="24"
				bgGradient="to-r"
				gradientFrom="helios.solid"
				gradientTo="transparent"
			/>
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
				err instanceof ApiError
					? err.message
					: "Erro ao carregar o dashboard.",
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
