import { Chart, useChart } from "@chakra-ui/charts";
import {
	Box,
	Button,
	Field,
	Flex,
	Grid,
	Heading,
	HStack,
	Input,
	NativeSelect,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCircleDollarSign, LuDownload } from "react-icons/lu";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { KpiCard } from "@/components/company-dashboard/KpiCard";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type BankAccount,
	type FinanceiroReport,
	financeiroApi,
	formatMoney,
} from "@/lib/financeiro-api";

function yearRange() {
	const year = new Date().getFullYear();
	const from = new Date(year, 0, 1);
	const to = new Date(year, 11, 31);
	const iso = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	return { from: iso(from), to: iso(to) };
}

function formatCell(
	value: string | number | null | undefined,
	format?: string,
) {
	if (value === null || value === undefined || value === "") return "—";
	if (format === "money") return formatMoney(Number(value));
	return String(value);
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

function seriesAxisLabel(date: string) {
	if (date.length === 7) {
		const monthIndex = Number(date.slice(5, 7)) - 1;
		return MONTH_LABELS_PT[monthIndex] ?? date.slice(5);
	}
	const d = new Date(`${date}T12:00:00`);
	if (Number.isNaN(d.getTime())) return date;
	return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

type Props = {
	slug: string;
};

export function FinanceiroReportPage({ slug }: Props) {
	const defaults = yearRange();
	const [from, setFrom] = useState(defaults.from);
	const [to, setTo] = useState(defaults.to);
	const [bankAccountId, setBankAccountId] = useState("");
	const [banks, setBanks] = useState<BankAccount[]>([]);
	const [report, setReport] = useState<FinanceiroReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [downloading, setDownloading] = useState(false);

	const needsBank = slug === "extrato";

	useEffect(() => {
		if (!needsBank) return;
		void (async () => {
			try {
				const res = await financeiroApi.listBancos({ pageSize: 100 });
				setBanks(res.items);
				setBankAccountId((prev) => prev || res.items[0]?.id || "");
			} catch {
				/* ignore */
			}
		})();
	}, [needsBank]);

	useEffect(() => {
		if (needsBank && !bankAccountId) {
			setLoading(false);
			setReport(null);
			return;
		}

		void (async () => {
			try {
				setLoading(true);
				const data = await financeiroApi.getRelatorio(slug, {
					from,
					to,
					bankAccountId: needsBank ? bankAccountId : undefined,
				});
				setReport(data);
			} catch (error) {
				setReport(null);
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Erro ao carregar relatório",
					type: "error",
				});
			} finally {
				setLoading(false);
			}
		})();
	}, [slug, from, to, bankAccountId, needsBank]);

	async function handleDownload() {
		try {
			setDownloading(true);
			await financeiroApi.downloadRelatorioPdf(slug, {
				from,
				to,
				bankAccountId: needsBank ? bankAccountId : undefined,
			});
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao baixar PDF",
				type: "error",
			});
		} finally {
			setDownloading(false);
		}
	}

	const chartSeries = report?.series ?? [];
	const chartIsMonthly =
		chartSeries.length > 0 && chartSeries.every((s) => s.date.length === 7);

	const chart = useChart({
		data: chartSeries.map((s) => ({
			label: seriesAxisLabel(s.date),
			entradas: (s.entradasRealizadas ?? 0) + (s.entradasPrevistas ?? 0),
			saidas: (s.saidasRealizadas ?? 0) + (s.saidasPrevistas ?? 0),
			saldoAcumulado: s.saldoAcumulado ?? 0,
		})),
		series: [
			{ name: "entradas", color: "green.solid", label: "Entrada" },
			{ name: "saidas", color: "red.solid", label: "Saída" },
			{ name: "saldoAcumulado", color: "blue.solid", label: "Saldo acumulado" },
		],
	});

	return (
		<Stack gap={6}>
			<Flex
				justify="space-between"
				align={{ base: "stretch", md: "end" }}
				gap={4}
				flexWrap="wrap"
			>
				<Box>
					<Text fontSize="sm" color="fg.muted" fontWeight="600">
						Relatórios
					</Text>
					<Heading size="lg">
						{report?.meta.title ?? slug.replace(/-/g, " ")}
					</Heading>
				</Box>
				<Button
					onClick={() => void handleDownload()}
					loading={downloading}
					disabled={!report || (needsBank && !bankAccountId)}
				>
					<LuDownload />
					Baixar PDF
				</Button>
			</Flex>

			<HStack gap={3} flexWrap="wrap" align="end">
				<Field.Root maxW="180px">
					<Field.Label>De</Field.Label>
					<Input
						type="date"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
					/>
				</Field.Root>
				<Field.Root maxW="180px">
					<Field.Label>Até</Field.Label>
					<Input
						type="date"
						value={to}
						onChange={(e) => setTo(e.target.value)}
					/>
				</Field.Root>
				{needsBank ? (
					<Field.Root maxW="320px">
						<Field.Label>Conta bancária</Field.Label>
						<NativeSelect.Root>
							<NativeSelect.Field
								value={bankAccountId}
								onChange={(e) => setBankAccountId(e.target.value)}
							>
								<option value="">Selecione</option>
								{banks.map((b) => (
									<option key={b.id} value={b.id}>
										{b.banco} — ag {b.agencia} / cc {b.conta}
									</option>
								))}
							</NativeSelect.Field>
						</NativeSelect.Root>
					</Field.Root>
				) : null}
			</HStack>

			{loading ? (
				<Stack align="center" py={16}>
					<Spinner />
				</Stack>
			) : !report ? (
				<Text color="fg.muted">
					{needsBank && !bankAccountId
						? "Selecione uma conta bancária para ver o extrato."
						: "Sem dados para o período."}
				</Text>
			) : (
				<>
					{report.bankAccountLabel ? (
						<Text fontSize="sm" color="fg.muted">
							Conta: {report.bankAccountLabel}
						</Text>
					) : null}

					{report.kpis.length > 0 ? (
						<Grid
							templateColumns={{
								base: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(4, 1fr)",
							}}
							gap={4}
						>
							{report.kpis.map((kpi) => (
								<KpiCard
									key={kpi.label}
									icon={LuCircleDollarSign}
									label={kpi.label}
									value={
										kpi.format === "number"
											? String(kpi.value)
											: kpi.format === "percent"
												? `${kpi.value}%`
												: formatMoney(kpi.value)
									}
									description="Período filtrado"
									deltaPercent={null}
									trend="neutral"
								/>
							))}
						</Grid>
					) : null}

					{report.aging && report.aging.length > 0 ? (
						<Box
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border"
							borderRadius="2xl"
							p={4}
						>
							<Heading size="sm" mb={3}>
								Aging
							</Heading>
							<Table.ScrollArea>
								<Table.Root size="sm">
									<Table.Header>
										<Table.Row>
											<Table.ColumnHeader>Faixa</Table.ColumnHeader>
											<Table.ColumnHeader textAlign="end">
												Qtd
											</Table.ColumnHeader>
											<Table.ColumnHeader textAlign="end">
												Valor
											</Table.ColumnHeader>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{report.aging.map((a) => (
											<Table.Row key={a.bucket}>
												<Table.Cell>{a.bucket}</Table.Cell>
												<Table.Cell textAlign="end">{a.quantidade}</Table.Cell>
												<Table.Cell textAlign="end">
													{formatMoney(a.valor)}
												</Table.Cell>
											</Table.Row>
										))}
									</Table.Body>
								</Table.Root>
							</Table.ScrollArea>
						</Box>
					) : null}

					{report.series && report.series.length > 0 ? (
						<Box
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border"
							borderRadius="2xl"
							p={4}
							h="360px"
						>
							<Heading size="sm" mb={3}>
								{chartIsMonthly ? "Série mensal" : "Série diária"}
							</Heading>
							<Chart.Root chart={chart} h="300px">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chart.data}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="label" tick={{ fontSize: 11 }} />
										<YAxis tick={{ fontSize: 11 }} />
										<Tooltip content={<Chart.Tooltip />} />
										<Legend />
										{chart.series.map((s) => (
											<Line
												key={s.name}
												type="monotone"
												dataKey={s.name}
												stroke={chart.color(s.color)}
												dot={false}
												strokeWidth={2}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</Chart.Root>
						</Box>
					) : null}

					<Box
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border"
						borderRadius="2xl"
						p={4}
					>
						<Heading size="sm" mb={3}>
							Detalhe
						</Heading>
						{report.rows.length === 0 ? (
							<Text color="fg.muted">Sem registros no período.</Text>
						) : (
							<Table.ScrollArea maxH="520px">
								<Table.Root size="sm" stickyHeader>
									<Table.Header>
										<Table.Row>
											{report.columns.map((col) => (
												<Table.ColumnHeader
													key={col.key}
													textAlign={col.align === "right" ? "end" : "start"}
												>
													{col.label}
												</Table.ColumnHeader>
											))}
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{report.rows.map((row) => {
											const key = report.columns
												.map((col) => String(row[col.key] ?? ""))
												.join("|");
											return (
												<Table.Row key={key}>
													{report.columns.map((col) => (
														<Table.Cell
															key={col.key}
															textAlign={
																col.align === "right" ? "end" : "start"
															}
														>
															{formatCell(row[col.key], col.format)}
														</Table.Cell>
													))}
												</Table.Row>
											);
										})}
									</Table.Body>
								</Table.Root>
							</Table.ScrollArea>
						)}
					</Box>
				</>
			)}
		</Stack>
	);
}
