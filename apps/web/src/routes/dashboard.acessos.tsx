import {
	Button,
	HStack,
	Input,
	Spinner,
	Stack,
	Table,
	Tabs,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PageHeader } from "@/components/ui/PageHeader";
import { toaster } from "@/components/ui/toaster";
import {
	type ActiveSession,
	accessMonitorApi,
	type LoginAccessHistoryItem,
} from "@/lib/access-monitor-api";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const PERFIL_LABEL: Record<string, string> = {
	super: "Super",
	admin_empresa: "Admin empresa",
	cliente: "Cliente",
};

function formatDateTime(value: string) {
	return new Date(value).toLocaleString("pt-BR");
}

function formatLocation(row: {
	city: string | null;
	region: string | null;
	country: string | null;
}) {
	const parts = [row.city, row.region, row.country].filter(Boolean);
	return parts.length > 0 ? parts.join(", ") : "—";
}

function summarizeUserAgent(ua: string | null) {
	if (!ua) return "—";
	const paren = ua.match(/\(([^)]+)\)/);
	if (paren?.[1]) return paren[1];
	return ua.length > 80 ? `${ua.slice(0, 77)}…` : ua;
}

export default function DashboardAcessos() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;

	const [tab, setTab] = useState("sessions");
	const [sessions, setSessions] = useState<ActiveSession[]>([]);
	const [sessionsTotal, setSessionsTotal] = useState(0);
	const [sessionsLoading, setSessionsLoading] = useState(true);

	const [history, setHistory] = useState<LoginAccessHistoryItem[]>([]);
	const [historyTotal, setHistoryTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [historyLoading, setHistoryLoading] = useState(true);

	useEffect(() => {
		if (sessionPending) return;
		if (perfil !== "super") {
			navigate("/dashboard", { replace: true });
		}
	}, [perfil, sessionPending, navigate]);

	const loadSessions = useCallback(async () => {
		setSessionsLoading(true);
		try {
			const result = await accessMonitorApi.sessions();
			setSessions(result.items);
			setSessionsTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao listar sessões ativas",
				type: "error",
			});
		} finally {
			setSessionsLoading(false);
		}
	}, []);

	const loadHistory = useCallback(async () => {
		setHistoryLoading(true);
		try {
			const result = await accessMonitorApi.history({
				q: search || undefined,
				page,
				pageSize,
			});
			setHistory(result.items);
			setHistoryTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao listar histórico de acessos",
				type: "error",
			});
		} finally {
			setHistoryLoading(false);
		}
	}, [search, page, pageSize]);

	useEffect(() => {
		if (perfil !== "super") return;
		void loadSessions();
		const timer = setInterval(() => {
			void loadSessions();
		}, 30000);
		return () => clearInterval(timer);
	}, [perfil, loadSessions]);

	useEffect(() => {
		if (perfil !== "super") return;
		void loadHistory();
	}, [perfil, loadHistory]);

	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1);
			setSearch(q.trim());
		}, 350);
		return () => clearTimeout(t);
	}, [q]);

	if (sessionPending || perfil !== "super") {
		return (
			<HStack justify="center" py={16}>
				<Spinner />
			</HStack>
		);
	}

	const totalPages = Math.max(1, Math.ceil(historyTotal / pageSize));

	return (
		<Stack gap={6}>
			<PageHeader
				eyebrow="Módulo"
				title="Acessos"
				description="Quem está no sistema agora e de onde entrou."
			/>

			<Tabs.Root
				value={tab}
				onValueChange={(e) => setTab(e.value)}
				variant="enclosed"
			>
				<Tabs.List>
					<Tabs.Trigger value="sessions">
						Sessões ativas ({sessionsTotal})
					</Tabs.Trigger>
					<Tabs.Trigger value="history">Histórico</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="sessions" pt={4}>
					{sessionsLoading && sessions.length === 0 ? (
						<HStack justify="center" py={10}>
							<Spinner />
						</HStack>
					) : sessions.length === 0 ? (
						<Text color="fg.muted" py={8}>
							Nenhuma sessão ativa.
						</Text>
					) : (
						<Table.ScrollArea
							borderWidth="1px"
							borderColor="helios.border"
							rounded="md"
						>
							<Table.Root size="sm" stickyHeader>
								<Table.Header>
									<Table.Row bg="bg.muted">
										<Table.ColumnHeader>Usuário</Table.ColumnHeader>
										<Table.ColumnHeader hideBelow="md">
											Perfil
										</Table.ColumnHeader>
										<Table.ColumnHeader hideBelow="md">
											Empresa
										</Table.ColumnHeader>
										<Table.ColumnHeader>IP</Table.ColumnHeader>
										<Table.ColumnHeader>Origem</Table.ColumnHeader>
										<Table.ColumnHeader hideBelow="md">
											Dispositivo
										</Table.ColumnHeader>
										<Table.ColumnHeader hideBelow="md">
											Login
										</Table.ColumnHeader>
										<Table.ColumnHeader hideBelow="md">
											Expira
										</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{sessions.map((row) => (
										<Table.Row key={row.id}>
											<Table.Cell>
												<Stack gap={0}>
													<Text fontWeight="medium">{row.userName}</Text>
													<Text fontSize="xs" color="fg.muted">
														{row.userEmail}
													</Text>
												</Stack>
											</Table.Cell>
											<Table.Cell hideBelow="md">
												{PERFIL_LABEL[row.perfil] ?? row.perfil}
											</Table.Cell>
											<Table.Cell hideBelow="md">
												{row.companyName ?? "—"}
											</Table.Cell>
											<Table.Cell>{row.ipAddress ?? "—"}</Table.Cell>
											<Table.Cell>{formatLocation(row)}</Table.Cell>
											<Table.Cell hideBelow="md" title={row.userAgent ?? ""}>
												{summarizeUserAgent(row.userAgent)}
											</Table.Cell>
											<Table.Cell hideBelow="md">
												{formatDateTime(row.createdAt)}
											</Table.Cell>
											<Table.Cell hideBelow="md">
												{formatDateTime(row.expiresAt)}
											</Table.Cell>
										</Table.Row>
									))}
								</Table.Body>
							</Table.Root>
						</Table.ScrollArea>
					)}
				</Tabs.Content>

				<Tabs.Content value="history" pt={4}>
					<Stack gap={4}>
						<Input
							placeholder="Pesquisar por nome, e-mail, IP ou cidade…"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							maxW={{ md: "360px" }}
						/>

						{historyLoading && history.length === 0 ? (
							<HStack justify="center" py={10}>
								<Spinner />
							</HStack>
						) : history.length === 0 ? (
							<Text color="fg.muted" py={8}>
								Nenhum acesso registrado.
							</Text>
						) : (
							<Table.ScrollArea
								borderWidth="1px"
								borderColor="helios.border"
								rounded="md"
							>
								<Table.Root size="sm" stickyHeader>
									<Table.Header>
										<Table.Row bg="bg.muted">
											<Table.ColumnHeader>Usuário</Table.ColumnHeader>
											<Table.ColumnHeader hideBelow="md">
												Perfil
											</Table.ColumnHeader>
											<Table.ColumnHeader hideBelow="md">
												Empresa
											</Table.ColumnHeader>
											<Table.ColumnHeader>IP</Table.ColumnHeader>
											<Table.ColumnHeader>Origem</Table.ColumnHeader>
											<Table.ColumnHeader hideBelow="md">
												Dispositivo
											</Table.ColumnHeader>
											<Table.ColumnHeader>Quando</Table.ColumnHeader>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{history.map((row) => (
											<Table.Row key={row.id}>
												<Table.Cell>
													<Stack gap={0}>
														<Text fontWeight="medium">{row.userName}</Text>
														<Text fontSize="xs" color="fg.muted">
															{row.userEmail}
														</Text>
													</Stack>
												</Table.Cell>
												<Table.Cell hideBelow="md">
													{PERFIL_LABEL[row.perfil] ?? row.perfil}
												</Table.Cell>
												<Table.Cell hideBelow="md">
													{row.companyName ?? "—"}
												</Table.Cell>
												<Table.Cell>{row.ipAddress ?? "—"}</Table.Cell>
												<Table.Cell>{formatLocation(row)}</Table.Cell>
												<Table.Cell hideBelow="md" title={row.userAgent ?? ""}>
													{summarizeUserAgent(row.userAgent)}
												</Table.Cell>
												<Table.Cell>{formatDateTime(row.loggedAt)}</Table.Cell>
											</Table.Row>
										))}
									</Table.Body>
								</Table.Root>
							</Table.ScrollArea>
						)}

						<HStack justify="space-between">
							<Text fontSize="sm" color="fg.muted">
								{historyTotal} registro(s) — página {page} de {totalPages}
							</Text>
							<HStack>
								<Button
									size="sm"
									variant="outline"
									disabled={page <= 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
								>
									Anterior
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={page >= totalPages}
									onClick={() => setPage((p) => p + 1)}
								>
									Próxima
								</Button>
							</HStack>
						</HStack>
					</Stack>
				</Tabs.Content>
			</Tabs.Root>
		</Stack>
	);
}
