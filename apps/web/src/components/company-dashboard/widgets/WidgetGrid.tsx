import {
	Badge,
	Box,
	Button,
	Field,
	Flex,
	Heading,
	HStack,
	Input,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Reorder } from "framer-motion";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import { HeliosCard } from "@/components/ui/HeliosCard";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	createDashboardFavorite,
	createDashboardGoal,
	type DashboardWidgets,
	fetchDashboardWidgets,
	softDeleteDashboardFavorite,
	softDeleteDashboardGoal,
	updateDashboardWidgetLayout,
} from "@/lib/company-dashboard-api";

type WidgetId = DashboardWidgets["layout"]["widgetOrder"][number];

function money(n: number) {
	return n.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function WidgetHeader({ title }: { title: string }) {
	return (
		<Heading as="h3" size="sm" fontFamily="heading" fontWeight="700" mb={4}>
			{title}
		</Heading>
	);
}

function CalendarWidget({ data }: { data: DashboardWidgets["calendar"] }) {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setHours(0, 0, 0, 0);
	const day = weekStart.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	weekStart.setDate(weekStart.getDate() + diff);

	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(weekStart);
		d.setDate(weekStart.getDate() + i);
		return d;
	});

	const upcoming = data.slice(0, 4);

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Calendário" />
			<SimpleGrid columns={7} gap={1} mb={4}>
				{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((label) => (
					<Text
						key={label}
						fontSize="2xs"
						color="fg.muted"
						textAlign="center"
						fontWeight="600"
					>
						{label.charAt(0)}
					</Text>
				))}
				{days.map((d) => {
					const hasEvent = data.some((e) => {
						const ed = new Date(e.startsAt);
						return (
							ed.getFullYear() === d.getFullYear() &&
							ed.getMonth() === d.getMonth() &&
							ed.getDate() === d.getDate()
						);
					});
					const isToday =
						d.getFullYear() === now.getFullYear() &&
						d.getMonth() === now.getMonth() &&
						d.getDate() === now.getDate();
					return (
						<Flex
							key={d.toISOString()}
							align="center"
							justify="center"
							h="8"
							rounded="md"
							fontSize="xs"
							fontWeight={hasEvent || isToday ? "700" : "500"}
							bg={hasEvent ? "helios.subtle" : "transparent"}
							color={hasEvent ? "helios.fg" : "fg"}
							borderWidth={isToday ? "1px" : hasEvent ? "1px" : "0"}
							borderColor="helios.border"
						>
							{d.getDate()}
						</Flex>
					);
				})}
			</SimpleGrid>
			<VStack align="stretch" gap={2}>
				{upcoming.length === 0 ? (
					<Text fontSize="sm" color="fg.muted">
						Sem eventos nos próximos dias.{" "}
						<Link to="/dashboard/agendamentos">Criar agendamento</Link>
					</Text>
				) : (
					upcoming.map((e) => (
						<HStack key={e.id} justify="space-between" fontSize="sm">
							<Text truncate>{e.title}</Text>
							<Text color="fg.muted" flexShrink={0}>
								{new Date(e.startsAt).toLocaleDateString("pt-BR", {
									day: "2-digit",
									month: "short",
								})}
							</Text>
						</HStack>
					))
				)}
			</VStack>
		</HeliosCard>
	);
}

function TimelineWidget({ data }: { data: DashboardWidgets["timeline"] }) {
	const toneColor = {
		info: "blue.fg",
		success: "green.fg",
		warning: "orange.fg",
		error: "red.fg",
	} as const;

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Timeline" />
			{data.length === 0 ? (
				<Text fontSize="sm" color="fg.muted">
					Sem atividade recente.
				</Text>
			) : (
				<VStack align="stretch" gap={0} position="relative" ps={4}>
					<Box
						position="absolute"
						left="1"
						top={1}
						bottom={1}
						w="1px"
						bg="border"
					/>
					{data.map((item) => (
						<Box key={item.id} position="relative" pb={4}>
							<Box
								position="absolute"
								left="-3.5"
								top="1"
								w="2.5"
								h="2.5"
								rounded="full"
								bg="helios.panel"
								borderWidth="2px"
								borderColor={toneColor[item.tone]}
							/>
							<Text fontSize="sm" fontWeight="600">
								{item.title}
							</Text>
							<Text fontSize="xs" color="fg.muted">
								{item.meta}
							</Text>
						</Box>
					))}
				</VStack>
			)}
		</HeliosCard>
	);
}

function FavoritesWidget({
	data,
	onChanged,
}: {
	data: DashboardWidgets["favorites"];
	onChanged: () => void;
}) {
	const [label, setLabel] = useState("");
	const [path, setPath] = useState("/dashboard/");
	const [adding, setAdding] = useState(false);

	async function handleAdd() {
		if (!label.trim() || !path.trim()) return;
		setAdding(true);
		try {
			await createDashboardFavorite({
				label: label.trim(),
				path: path.trim(),
			});
			setLabel("");
			setPath("/dashboard/");
			onChanged();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setAdding(false);
		}
	}

	async function handleRemove(id: string) {
		if (id.startsWith("seed-")) {
			toaster.create({
				title: "Salve um favorito próprio para personalizar",
				type: "info",
			});
			return;
		}
		try {
			await softDeleteDashboardFavorite(id);
			onChanged();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao remover",
				type: "error",
			});
		}
	}

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Favoritos" />
			<SimpleGrid columns={2} gap={2} mb={3}>
				{data.map((f) => (
					<Box key={f.id} position="relative">
						<Link to={f.path} style={{ textDecoration: "none" }}>
							<Box
								p={3}
								rounded="xl"
								borderWidth="1px"
								borderColor="border"
								bg="bg.subtle"
								_hover={{ borderColor: "helios.border", bg: "helios.subtle" }}
							>
								<Text fontSize="sm" fontWeight="600" color="fg">
									{f.label}
								</Text>
							</Box>
						</Link>
						{!f.id.startsWith("seed-") ? (
							<Button
								size="2xs"
								variant="ghost"
								position="absolute"
								top="1"
								right="1"
								onClick={() => void handleRemove(f.id)}
							>
								×
							</Button>
						) : null}
					</Box>
				))}
			</SimpleGrid>
			<Stack gap={2}>
				<Field.Root>
					<Input
						size="sm"
						placeholder="Rótulo"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
					/>
				</Field.Root>
				<Field.Root>
					<Input
						size="sm"
						placeholder="/dashboard/..."
						value={path}
						onChange={(e) => setPath(e.target.value)}
					/>
				</Field.Root>
				<Button
					size="sm"
					variant="outline"
					loading={adding}
					onClick={() => void handleAdd()}
				>
					Adicionar
				</Button>
			</Stack>
		</HeliosCard>
	);
}

function GoalsWidget({
	data,
	onChanged,
}: {
	data: DashboardWidgets["goals"];
	onChanged: () => void;
}) {
	const [label, setLabel] = useState("");
	const [target, setTarget] = useState("");
	const [progress, setProgress] = useState("0");
	const [saving, setSaving] = useState(false);

	async function handleAdd() {
		if (!label.trim() || !target.trim()) return;
		setSaving(true);
		try {
			await createDashboardGoal({
				label: label.trim(),
				targetLabel: target.trim(),
				progress: Math.min(100, Math.max(0, Number(progress) || 0)),
			});
			setLabel("");
			setTarget("");
			setProgress("0");
			onChanged();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Metas" />
			<VStack align="stretch" gap={4} mb={4}>
				{data.length === 0 ? (
					<Text fontSize="sm" color="fg.muted">
						Nenhuma meta cadastrada.
					</Text>
				) : (
					data.map((g) => (
						<Stack key={g.id} gap={1.5}>
							<HStack justify="space-between">
								<Text fontSize="sm" fontWeight="600">
									{g.label}
								</Text>
								<HStack gap={2}>
									<Text fontSize="xs" color="fg.muted">
										{g.targetLabel}
									</Text>
									<Button
										size="2xs"
										variant="ghost"
										onClick={() =>
											void softDeleteDashboardGoal(g.id).then(onChanged)
										}
									>
										×
									</Button>
								</HStack>
							</HStack>
							<Progress.Root value={g.progress} size="sm" colorPalette="helios">
								<Progress.Track>
									<Progress.Range />
								</Progress.Track>
							</Progress.Root>
						</Stack>
					))
				)}
			</VStack>
			<Stack gap={2}>
				<Input
					size="sm"
					placeholder="Meta"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
				/>
				<Input
					size="sm"
					placeholder="Alvo (ex.: 90%)"
					value={target}
					onChange={(e) => setTarget(e.target.value)}
				/>
				<Input
					size="sm"
					type="number"
					placeholder="% progresso"
					value={progress}
					onChange={(e) => setProgress(e.target.value)}
				/>
				<Button
					size="sm"
					variant="outline"
					loading={saving}
					onClick={() => void handleAdd()}
				>
					Adicionar meta
				</Button>
			</Stack>
		</HeliosCard>
	);
}

function FinanceWidget({ data }: { data: DashboardWidgets["finance"] }) {
	const cells: [string, string][] = [
		["A receber", money(data.receber)],
		["A pagar", money(data.pagar)],
		["Saldo", money(data.saldo)],
		[
			"Tendência",
			data.trendPercent == null
				? "—"
				: `${data.trendPercent > 0 ? "+" : ""}${data.trendPercent}%`,
		],
	];
	return (
		<HeliosCard h="full" glow>
			<WidgetHeader title="Resumo financeiro" />
			<SimpleGrid columns={2} gap={3}>
				{cells.map(([label, value]) => (
					<Box
						key={label}
						p={3}
						rounded="xl"
						bg="bg.subtle"
						borderWidth="1px"
						borderColor="border"
					>
						<Text fontSize="xs" color="fg.muted">
							{label}
						</Text>
						<Text
							fontFamily="heading"
							fontWeight="800"
							fontSize="lg"
							color={label === "Tendência" ? "helios.fg" : "fg"}
						>
							{value}
						</Text>
					</Box>
				))}
			</SimpleGrid>
		</HeliosCard>
	);
}

function AlertsWidget({ data }: { data: DashboardWidgets["alerts"] }) {
	const levelColor = {
		warning: "orange",
		info: "blue",
		error: "red",
	} as const;

	return (
		<HeliosCard h="full">
			<WidgetHeader title="Alertas" />
			{data.length === 0 ? (
				<Text fontSize="sm" color="fg.muted">
					Nenhum alerta no momento.
				</Text>
			) : (
				<VStack align="stretch" gap={2}>
					{data.map((a) => (
						<HStack
							key={a.id}
							p={3}
							rounded="xl"
							borderWidth="1px"
							borderColor="border"
							bg="bg.subtle"
							gap={3}
						>
							<Badge colorPalette={levelColor[a.level]} variant="subtle">
								{a.level}
							</Badge>
							<Text fontSize="sm" lineHeight="short">
								{a.title}
							</Text>
						</HStack>
					))}
				</VStack>
			)}
		</HeliosCard>
	);
}

export function WidgetGrid() {
	const [data, setData] = useState<DashboardWidgets | null>(null);
	const [order, setOrder] = useState<WidgetId[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		try {
			const result = await fetchDashboardWidgets();
			setData(result);
			setOrder(result.layout.widgetOrder);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao carregar widgets",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!data || order.length === 0) return;
		const same =
			order.length === data.layout.widgetOrder.length &&
			order.every((id, i) => id === data.layout.widgetOrder[i]);
		if (same) return;
		const t = setTimeout(() => {
			void updateDashboardWidgetLayout({ widgetOrder: order }).catch(() => {
				/* silent */
			});
		}, 500);
		return () => clearTimeout(t);
	}, [order, data]);

	if (loading || !data) {
		return (
			<Text fontSize="sm" color="fg.muted">
				Carregando widgets…
			</Text>
		);
	}

	const map: Record<WidgetId, () => ReactNode> = {
		calendar: () => <CalendarWidget data={data.calendar} />,
		timeline: () => <TimelineWidget data={data.timeline} />,
		favorites: () => (
			<FavoritesWidget data={data.favorites} onChanged={() => void load()} />
		),
		goals: () => (
			<GoalsWidget data={data.goals} onChanged={() => void load()} />
		),
		finance: () => <FinanceWidget data={data.finance} />,
		alerts: () => <AlertsWidget data={data.alerts} />,
	};

	return (
		<Box>
			<Box mb={4} display="flex" alignItems="center" gap={2} flexWrap="wrap">
				<Text fontFamily="heading" fontWeight="700" fontSize="md">
					Widgets inteligentes
				</Text>
				<Badge
					bg="helios.subtle"
					color="helios.fg"
					fontSize="2xs"
					textTransform="uppercase"
					letterSpacing="0.06em"
					fontWeight="700"
					borderWidth="1px"
					borderColor="helios.border"
				>
					arraste para reordenar
				</Badge>
			</Box>
			<Reorder.Group
				axis="y"
				values={order}
				onReorder={setOrder}
				as="div"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "1rem",
					listStyle: "none",
					padding: 0,
					margin: 0,
				}}
			>
				{order.map((id) => {
					const Render = map[id];
					return (
						<Reorder.Item
							key={id}
							value={id}
							as="div"
							style={{ cursor: "grab" }}
							whileDrag={{
								scale: 1.02,
								cursor: "grabbing",
								zIndex: 10,
								boxShadow: "0 16px 48px rgba(15, 17, 23, 0.2)",
							}}
						>
							{Render()}
						</Reorder.Item>
					);
				})}
			</Reorder.Group>
		</Box>
	);
}
