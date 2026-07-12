import { Chart, useChart } from "@chakra-ui/charts";
import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
	LuBanknote,
	LuCircleDollarSign,
	LuClock,
	LuDownload,
	LuTrendingUp,
	LuWallet,
} from "react-icons/lu";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { KpiCard } from "@/components/company-dashboard/KpiCard";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type FinanceiroDashboard,
	financeiroApi,
	formatMoney,
} from "@/lib/financeiro-api";

const PIE_COLORS = [
	"blue.solid",
	"green.solid",
	"orange.solid",
	"purple.solid",
	"teal.solid",
	"red.solid",
	"yellow.solid",
	"cyan.solid",
];

export default function FinanceiroDashboardPage() {
	const [data, setData] = useState<FinanceiroDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [downloadingPdf, setDownloadingPdf] = useState(false);

	useEffect(() => {
		void (async () => {
			try {
				setData(await financeiroApi.dashboard());
			} catch (error) {
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Erro ao carregar dashboard",
					type: "error",
				});
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	async function handleDownloadPdf() {
		try {
			setDownloadingPdf(true);
			await financeiroApi.downloadSaudeFinanceiraPdf();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao baixar PDF",
				type: "error",
			});
		} finally {
			setDownloadingPdf(false);
		}
	}

	if (loading) {
		return (
			<Stack align="center" py={20}>
				<Spinner />
			</Stack>
		);
	}

	if (!data) {
		return <Text color="fg.muted">Sem dados.</Text>;
	}

	const { kpis } = data;

	return (
		<Stack gap={8}>
			<Flex
				direction={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "flex-start" }}
				justify="space-between"
				gap={4}
			>
				<Box>
					<Heading
						as="h1"
						size="xl"
						fontFamily="heading"
						fontWeight="800"
						mb={1}
					>
						Saúde financeira
					</Heading>
					<Text color="fg.muted">Indicadores e visão consolidada do mês</Text>
				</Box>
				<Button
					colorPalette="blue"
					variant="solid"
					onClick={() => void handleDownloadPdf()}
					loading={downloadingPdf}
					disabled={downloadingPdf}
					alignSelf={{ base: "stretch", md: "flex-start" }}
				>
					<LuDownload />
					Baixar PDF
				</Button>
			</Flex>

			<Grid
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					xl: "repeat(4, 1fr)",
				}}
				gap={4}
			>
				<KpiCard
					icon={LuWallet}
					label="Saldo atual"
					value={formatMoney(kpis.saldoAtual)}
					description="Soma das contas bancárias"
					deltaPercent={null}
					trend="neutral"
				/>
				<KpiCard
					icon={LuBanknote}
					label="Receber hoje"
					value={formatMoney(kpis.contasReceberHoje)}
					description={`Recebido hoje: ${formatMoney(kpis.recebimentosHoje)}`}
					deltaPercent={null}
					trend="up"
				/>
				<KpiCard
					icon={LuCircleDollarSign}
					label="Pagar hoje"
					value={formatMoney(kpis.contasPagarHoje)}
					description={`Pago hoje: ${formatMoney(kpis.pagamentosHoje)}`}
					deltaPercent={null}
					trend="down"
				/>
				<KpiCard
					icon={LuTrendingUp}
					label="Lucro do mês"
					value={formatMoney(kpis.lucroMes)}
					description={`Margem ${kpis.margemPercent}%`}
					deltaPercent={kpis.margemPercent}
					trend={kpis.lucroMes >= 0 ? "up" : "down"}
				/>
				<KpiCard
					icon={LuBanknote}
					label="Recebimentos do mês"
					value={formatMoney(kpis.recebimentosMes)}
					description={`Bruta ${formatMoney(kpis.receitaBrutaMes)}`}
					deltaPercent={null}
					trend="up"
				/>
				<KpiCard
					icon={LuCircleDollarSign}
					label="Pagamentos do mês"
					value={formatMoney(kpis.pagamentosMes)}
					description={`Despesas ${formatMoney(kpis.despesasMes)}`}
					deltaPercent={null}
					trend="down"
				/>
				<KpiCard
					icon={LuClock}
					label="Inadimplência"
					value={formatMoney(kpis.inadimplencia)}
					description={`${kpis.clientesInadimplentes} clientes`}
					deltaPercent={null}
					trend="down"
				/>
				<KpiCard
					icon={LuWallet}
					label="Valor em aberto"
					value={formatMoney(kpis.valorEmAberto)}
					description={`Ticket médio ${formatMoney(kpis.ticketMedio)}`}
					deltaPercent={null}
					trend="neutral"
				/>
			</Grid>

			<Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
				<ReceitasDespesasChart data={data.receitasDespesas} />
				<EvolucaoMensalChart data={data.evolucaoMensal} />
				<Box gridColumn={{ base: "auto", lg: "1 / -1" }}>
					<ProjecaoAnualChart data={data.projecaoAnual} />
				</Box>
				<CategoriaPieChart data={data.porCategoria} />
				<CentroPieChart data={data.porCentroCusto} />
				<PlanoContasChart data={data.planoContas} />
				<InadimplenciaChart data={data.inadimplenciaSplit} />
			</Grid>
		</Stack>
	);
}

function ChartShell({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) {
	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
			minH="320px"
		>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				{title}
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={6}>
				{subtitle}
			</Text>
			{children}
		</Box>
	);
}

function ReceitasDespesasChart({
	data,
}: {
	data: FinanceiroDashboard["receitasDespesas"];
}) {
	const chart = useChart({
		data: data.map((d) => ({
			month: d.month.slice(5),
			receitas: d.receitas,
			despesas: d.despesas,
		})),
		series: [
			{ name: "receitas", color: "green.solid", label: "Receitas" },
			{ name: "despesas", color: "red.solid", label: "Despesas" },
		],
	});
	return (
		<ChartShell title="Receitas x Despesas" subtitle="Últimos 6 meses">
			<Box h="240px">
				<Chart.Root maxH="240px" chart={chart} h="full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chart.data}>
							<CartesianGrid
								stroke={chart.color("border.muted")}
								vertical={false}
							/>
							<XAxis dataKey="month" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} width={48} />
							<Tooltip content={<Chart.Tooltip />} />
							<Legend />
							{chart.series.map((item) => (
								<Bar
									key={item.name}
									dataKey={item.name}
									fill={chart.color(item.color)}
									radius={[6, 6, 0, 0]}
								/>
							))}
						</BarChart>
					</ResponsiveContainer>
				</Chart.Root>
			</Box>
		</ChartShell>
	);
}

const MONTH_LABELS_PT = [
	"Jan",
	"Fev",
	"Mar",
	"Abr",
	"Mai",
	"Jun",
	"Jul",
	"Ago",
	"Set",
	"Out",
	"Nov",
	"Dez",
];

function ProjecaoAnualChart({
	data,
}: {
	data: FinanceiroDashboard["projecaoAnual"];
}) {
	const year = data[0]?.month.slice(0, 4) ?? String(new Date().getFullYear());
	const chart = useChart({
		data: data.map((d) => {
			const monthIndex = Number(d.month.slice(5, 7)) - 1;
			return {
				month: MONTH_LABELS_PT[monthIndex] ?? d.month.slice(5),
				receitas: d.receitas,
				despesas: d.despesas,
			};
		}),
		series: [
			{ name: "receitas", color: "green.solid", label: "Receitas" },
			{ name: "despesas", color: "red.solid", label: "Despesas" },
		],
	});
	return (
		<ChartShell
			title="Projeção do ano"
			subtitle={`${year} · por vencimento · 12 meses`}
		>
			<Box h="280px">
				<Chart.Root maxH="280px" chart={chart} h="full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chart.data}>
							<CartesianGrid
								stroke={chart.color("border.muted")}
								vertical={false}
							/>
							<XAxis dataKey="month" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} width={56} />
							<Tooltip content={<Chart.Tooltip />} />
							<Legend />
							{chart.series.map((item) => (
								<Bar
									key={item.name}
									dataKey={item.name}
									fill={chart.color(item.color)}
									radius={[6, 6, 0, 0]}
								/>
							))}
						</BarChart>
					</ResponsiveContainer>
				</Chart.Root>
			</Box>
		</ChartShell>
	);
}

function EvolucaoMensalChart({
	data,
}: {
	data: FinanceiroDashboard["evolucaoMensal"];
}) {
	const chart = useChart({
		data: data.map((d) => ({
			month: d.month.slice(5),
			receita: d.receita,
			despesa: d.despesa,
			lucro: d.lucro,
		})),
		series: [
			{ name: "receita", color: "green.solid", label: "Receita" },
			{ name: "despesa", color: "red.solid", label: "Despesa" },
			{ name: "lucro", color: "blue.solid", label: "Lucro" },
		],
	});
	return (
		<ChartShell title="Evolução mensal" subtitle="12 meses">
			<Box h="240px">
				<Chart.Root maxH="240px" chart={chart} h="full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chart.data}>
							<CartesianGrid
								stroke={chart.color("border.muted")}
								vertical={false}
							/>
							<XAxis dataKey="month" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} width={48} />
							<Tooltip content={<Chart.Tooltip />} />
							<Legend />
							{chart.series.map((item) => (
								<Line
									key={item.name}
									type="monotone"
									dataKey={item.name}
									stroke={chart.color(item.color)}
									strokeWidth={2}
									dot={false}
								/>
							))}
						</LineChart>
					</ResponsiveContainer>
				</Chart.Root>
			</Box>
		</ChartShell>
	);
}

function CategoriaPieChart({
	data,
}: {
	data: FinanceiroDashboard["porCategoria"];
}) {
	const chart = useChart({
		data: data.map((item, i) => ({
			name: item.name,
			valor: item.valor,
			color: PIE_COLORS[i % PIE_COLORS.length],
		})),
		series: [{ name: "valor", label: "Valor" }],
	});
	return (
		<ChartShell title="Contas por categoria" subtitle="Volume por categoria">
			{data.length === 0 ? (
				<Text color="fg.muted" textAlign="center" py={16}>
					Sem dados
				</Text>
			) : (
				<Box h="240px">
					<Chart.Root maxH="240px" chart={chart} h="full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip content={<Chart.Tooltip hideLabel />} />
								<Pie
									data={chart.data}
									dataKey="valor"
									nameKey="name"
									innerRadius="55%"
									outerRadius="85%"
									paddingAngle={2}
									strokeWidth={0}
								>
									{chart.data.map((item) => (
										<Cell
											key={item.name}
											fill={chart.color(item.color as string)}
										/>
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</Chart.Root>
				</Box>
			)}
		</ChartShell>
	);
}

function CentroPieChart({
	data,
}: {
	data: FinanceiroDashboard["porCentroCusto"];
}) {
	const chart = useChart({
		data: data.map((item, i) => ({
			name: item.name,
			valor: item.valor,
			color: PIE_COLORS[i % PIE_COLORS.length],
		})),
		series: [{ name: "valor", label: "Valor" }],
	});
	return (
		<ChartShell title="Contas por centro de custo" subtitle="Volume por centro">
			{data.length === 0 ? (
				<Text color="fg.muted" textAlign="center" py={16}>
					Sem dados
				</Text>
			) : (
				<Box h="240px">
					<Chart.Root maxH="240px" chart={chart} h="full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Tooltip content={<Chart.Tooltip hideLabel />} />
								<Pie
									data={chart.data}
									dataKey="valor"
									nameKey="name"
									innerRadius="55%"
									outerRadius="85%"
									paddingAngle={2}
									strokeWidth={0}
								>
									{chart.data.map((item) => (
										<Cell
											key={item.name}
											fill={chart.color(item.color as string)}
										/>
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</Chart.Root>
				</Box>
			)}
		</ChartShell>
	);
}

function PlanoContasChart({
	data,
}: {
	data: FinanceiroDashboard["planoContas"];
}) {
	const chart = useChart({
		data: data.map((d) => ({
			name: d.name,
			valor: d.valor,
			fill: d.tipo === "receita" ? "green.solid" : "red.solid",
		})),
		series: [{ name: "valor", label: "Valor" }],
	});
	return (
		<ChartShell title="Plano de contas" subtitle="Receitas e despesas">
			{data.length === 0 ? (
				<Text color="fg.muted" textAlign="center" py={16}>
					Sem dados
				</Text>
			) : (
				<Box h="240px">
					<Chart.Root maxH="240px" chart={chart} h="full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chart.data} layout="vertical">
								<CartesianGrid
									stroke={chart.color("border.muted")}
									horizontal={false}
								/>
								<XAxis type="number" tickLine={false} axisLine={false} />
								<YAxis
									type="category"
									dataKey="name"
									width={100}
									tickLine={false}
									axisLine={false}
								/>
								<Tooltip content={<Chart.Tooltip />} />
								<Bar dataKey="valor" radius={[0, 6, 6, 0]}>
									{chart.data.map((item) => (
										<Cell
											key={item.name}
											fill={chart.color(item.fill as string)}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</Chart.Root>
				</Box>
			)}
		</ChartShell>
	);
}

function InadimplenciaChart({
	data,
}: {
	data: FinanceiroDashboard["inadimplenciaSplit"];
}) {
	const chart = useChart({
		data: [
			{ name: "Em dia", valor: data.emDia, color: "green.solid" },
			{ name: "Vencido", valor: data.vencido, color: "red.solid" },
		],
		series: [{ name: "valor", label: "Valor" }],
	});
	return (
		<ChartShell
			title="Saúde / Inadimplência"
			subtitle="Contas a receber em aberto"
		>
			<Box h="240px">
				<Chart.Root maxH="240px" chart={chart} h="full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={chart.data}>
							<CartesianGrid
								stroke={chart.color("border.muted")}
								vertical={false}
							/>
							<XAxis dataKey="name" tickLine={false} axisLine={false} />
							<YAxis tickLine={false} axisLine={false} width={48} />
							<Tooltip content={<Chart.Tooltip />} />
							<Bar dataKey="valor" radius={[6, 6, 0, 0]}>
								{chart.data.map((item) => (
									<Cell
										key={item.name}
										fill={chart.color(item.color as string)}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Chart.Root>
			</Box>
		</ChartShell>
	);
}
