import {
	Badge,
	Button,
	Dialog,
	Field,
	Heading,
	HStack,
	Input,
	NativeSelect,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { FinancialEntryFormDialog } from "@/components/financeiro/FinancialEntryFormDialog";
import { MoneyInput } from "@/components/ui/money-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type BankAccount,
	type FinancialEntry,
	financeiroApi,
	formatDate,
	formatMoney,
} from "@/lib/financeiro-api";
import { numberToMoneyInput, parseMoneyInput } from "@/lib/money";

type FinancialEntriesPageProps = {
	kind: "receber" | "pagar";
};

const STATUS_LABEL: Record<FinancialEntry["status"], string> = {
	em_aberto: "Em aberto",
	parcial: "Parcial",
	pago: "Pago",
	cancelado: "Cancelado",
	vencido: "Vencido",
};

const STATUS_COLOR: Record<FinancialEntry["status"], string> = {
	em_aberto: "gray",
	parcial: "yellow",
	pago: "green",
	cancelado: "red",
	vencido: "orange",
};

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function todayIsoDate() {
	return new Date().toISOString().slice(0, 10);
}

function monthRange() {
	const now = new Date();
	const from = new Date(now.getFullYear(), now.getMonth(), 1);
	const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	const iso = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	return { from: iso(from), to: iso(to) };
}

export function FinancialEntriesPage({ kind }: FinancialEntriesPageProps) {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("financeiro");
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const highlightId = searchParams.get("id");
	const openedQueryId = useRef<string | null>(null);

	const defaults = monthRange();
	const [items, setItems] = useState<FinancialEntry[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [fromDraft, setFromDraft] = useState(defaults.from);
	const [toDraft, setToDraft] = useState(defaults.to);
	const [from, setFrom] = useState(defaults.from);
	const [to, setTo] = useState(defaults.to);
	const [loading, setLoading] = useState(true);

	const [formOpen, setFormOpen] = useState(false);
	const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
	const [selected, setSelected] = useState<FinancialEntry | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [cancelOpen, setCancelOpen] = useState(false);

	const [baixarOpen, setBaixarOpen] = useState(false);
	const [bancos, setBancos] = useState<BankAccount[]>([]);
	const [baixarValor, setBaixarValor] = useState("");
	const [baixarBankId, setBaixarBankId] = useState("");
	const [baixarData, setBaixarData] = useState(todayIsoDate());
	const [baixarSaving, setBaixarSaving] = useState(false);

	const title = kind === "receber" ? "Contas a receber" : "Contas a pagar";
	const subtitle =
		kind === "receber"
			? "Recebimentos e títulos a receber"
			: "Pagamentos e títulos a pagar";
	const partyLabel = kind === "receber" ? "Cliente" : "Fornecedor";
	const createLabel =
		kind === "receber" ? "Nova conta a receber" : "Nova conta a pagar";

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await financeiroApi.listLancamentos({
				q: search || undefined,
				kind,
				status: status || undefined,
				from,
				to,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao listar lançamentos",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [search, status, from, to, kind, page, pageSize]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!highlightId || !UUID_RE.test(highlightId)) return;
		if (openedQueryId.current === highlightId) return;
		let cancelled = false;
		void (async () => {
			try {
				const entry = await financeiroApi.findLancamento(highlightId);
				if (cancelled) return;
				if (entry.kind !== kind) {
					const path =
						entry.kind === "pagar"
							? "/dashboard/financeiro/contas-a-pagar"
							: "/dashboard/financeiro/contas-a-receber";
					navigate(`${path}?id=${entry.id}`, { replace: true });
					return;
				}
				openedQueryId.current = highlightId;
				const venc = entry.dataVencimento.slice(0, 10);
				setFrom((prev) => (prev <= venc ? prev : venc));
				setTo((prev) => (prev >= venc ? prev : venc));
				setFromDraft((prev) => (prev <= venc ? prev : venc));
				setToDraft((prev) => (prev >= venc ? prev : venc));
				setQ("");
				setSearch("");
				setStatus("");
				setPage(1);
				setEditingEntry(entry);
				setFormOpen(true);
			} catch (error) {
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Lançamento não encontrado",
					type: "error",
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [highlightId, kind, navigate]);

	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1);
			setSearch(q.trim());
		}, 350);
		return () => clearTimeout(t);
	}, [q]);

	async function openBaixar(entry: FinancialEntry) {
		setSelected(entry);
		setBaixarValor(numberToMoneyInput(entry.valorAberto));
		setBaixarData(todayIsoDate());
		setBaixarBankId(entry.bankAccountId ?? "");
		try {
			const result = await financeiroApi.listBancos({ pageSize: 100 });
			setBancos(result.items);
			if (!entry.bankAccountId && result.items[0]) {
				setBaixarBankId(result.items[0].id);
			}
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar bancos",
				type: "error",
			});
		}
		setBaixarOpen(true);
	}

	async function handleBaixar() {
		if (!selected) return;
		const valor = parseMoneyInput(baixarValor);
		if (!valor || valor <= 0) {
			toaster.create({ title: "Valor inválido", type: "error" });
			return;
		}
		if (!baixarBankId) {
			toaster.create({ title: "Selecione a conta bancária", type: "error" });
			return;
		}
		setBaixarSaving(true);
		try {
			await financeiroApi.baixarLancamento(selected.id, {
				valor,
				bankAccountId: baixarBankId,
				dataPagamento: baixarData,
			});
			toaster.create({ title: "Baixa registrada", type: "success" });
			setBaixarOpen(false);
			setSelected(null);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao baixar",
				type: "error",
			});
		} finally {
			setBaixarSaving(false);
		}
	}

	async function handleCancel() {
		if (!selected) return;
		try {
			await financeiroApi.cancelLancamento(selected.id);
			toaster.create({ title: "Lançamento cancelado", type: "success" });
			setCancelOpen(false);
			setSelected(null);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao cancelar",
				type: "error",
			});
		}
	}

	async function handleDelete() {
		if (!selected) return;
		try {
			await financeiroApi.removeLancamento(selected.id);
			toaster.create({ title: "Lançamento excluído", type: "success" });
			setDeleteOpen(false);
			setSelected(null);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao excluir",
				type: "error",
			});
		}
	}

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<Stack gap={6}>
			<Stack gap={1}>
				<Text
					fontSize="xs"
					fontWeight="600"
					color="helios.fg"
					textTransform="uppercase"
					letterSpacing="0.08em"
				>
					Financeiro
				</Text>
				<Heading as="h1" size="xl" letterSpacing="-0.02em">
					{title}
				</Heading>
				<Text color="fg.muted">{subtitle}</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "end" }}
				flexWrap="wrap"
			>
				<Field.Root maxW={{ md: "320px" }} flex="1">
					<Field.Label>Pesquisar</Field.Label>
					<Input
						placeholder="Documento, número ou observação…"
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
				</Field.Root>
				<Field.Root maxW={{ md: "200px" }}>
					<Field.Label>Status</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={status}
							onChange={(e) => {
								setPage(1);
								setStatus(e.target.value);
							}}
						>
							<option value="">Todos os status</option>
							<option value="em_aberto">Em aberto</option>
							<option value="parcial">Parcial</option>
							<option value="pago">Pago</option>
							<option value="vencido">Vencido</option>
							<option value="cancelado">Cancelado</option>
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Field.Root>
				<Field.Root maxW={{ base: "100%", md: "180px" }}>
					<Field.Label>De</Field.Label>
					<Input
						type="date"
						value={fromDraft}
						onChange={(e) => setFromDraft(e.target.value)}
					/>
				</Field.Root>
				<Field.Root maxW={{ base: "100%", md: "180px" }}>
					<Field.Label>Até</Field.Label>
					<Input
						type="date"
						value={toDraft}
						onChange={(e) => setToDraft(e.target.value)}
					/>
				</Field.Root>
				<Button
					variant="outline"
					onClick={() => {
						setPage(1);
						setFrom(fromDraft);
						setTo(toDraft);
					}}
				>
					Pesquisar
				</Button>
				{allowEdit && (
					<Button
						bg="helios.solid"
						color="helios.contrast"
						onClick={() => {
							setEditingEntry(null);
							setFormOpen(true);
						}}
						ml={{ md: "auto" }}
					>
						{createLabel}
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum lançamento encontrado.
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
								<Table.ColumnHeader>Documento / Nº</Table.ColumnHeader>
								<Table.ColumnHeader>{partyLabel}</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">
									Categoria
								</Table.ColumnHeader>
								<Table.ColumnHeader>Vencimento</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">
									Valor original
								</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end" hideBelow="md">
									Valor aberto
								</Table.ColumnHeader>
								<Table.ColumnHeader>Status</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((item) => {
								const partyName =
									kind === "receber"
										? (item.clientName ?? "—")
										: (item.supplierName ?? "—");
								const docLabel =
									[item.documento, item.numero].filter(Boolean).join(" / ") ||
									"—";
								const canBaixar =
									item.status !== "pago" && item.status !== "cancelado";
								const canEditEntry = canBaixar;
								const isPago = item.status === "pago";
								const canCancel =
									item.valorPago === 0 && item.status !== "cancelado";

								return (
									<Table.Row
										key={item.id}
										bg={item.id === highlightId ? "bg.muted" : undefined}
									>
										<Table.Cell fontWeight="medium">{docLabel}</Table.Cell>
										<Table.Cell>{partyName}</Table.Cell>
										<Table.Cell hideBelow="md">
											{item.categoryName ?? "—"}
										</Table.Cell>
										<Table.Cell>{formatDate(item.dataVencimento)}</Table.Cell>
										<Table.Cell textAlign="end">
											{formatMoney(item.valorOriginal)}
										</Table.Cell>
										<Table.Cell textAlign="end" hideBelow="md">
											{formatMoney(item.valorAberto)}
										</Table.Cell>
										<Table.Cell>
											<Badge
												colorPalette={STATUS_COLOR[item.status]}
												size="sm"
												variant="subtle"
											>
												{STATUS_LABEL[item.status]}
											</Badge>
										</Table.Cell>
										<Table.Cell textAlign="end">
											<HStack gap={1} justify="flex-end" flexWrap="wrap">
												{isPago ? (
													<Button
														size="xs"
														variant="ghost"
														onClick={() => {
															setEditingEntry(item);
															setFormOpen(true);
														}}
													>
														Ver
													</Button>
												) : null}
												{allowEdit && canEditEntry ? (
													<Button
														size="xs"
														variant="ghost"
														onClick={() => {
															setEditingEntry(item);
															setFormOpen(true);
														}}
													>
														Editar
													</Button>
												) : null}
												{allowEdit && canBaixar ? (
													<Button
														size="xs"
														variant="ghost"
														onClick={() => void openBaixar(item)}
													>
														Baixar
													</Button>
												) : null}
												{allowEdit && canCancel ? (
													<Button
														size="xs"
														variant="ghost"
														onClick={() => {
															setSelected(item);
															setCancelOpen(true);
														}}
													>
														Cancelar
													</Button>
												) : null}
												{allowEdit ? (
													<Button
														size="xs"
														variant="ghost"
														colorPalette="red"
														onClick={() => {
															setSelected(item);
															setDeleteOpen(true);
														}}
													>
														Excluir
													</Button>
												) : null}
											</HStack>
										</Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					</Table.Root>
				</Table.ScrollArea>
			)}

			<HStack justify="space-between">
				<Text fontSize="sm" color="fg.muted">
					{total} registro(s) — página {page} de {totalPages}
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

			<FinancialEntryFormDialog
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) setEditingEntry(null);
				}}
				kind={kind}
				mode={
					editingEntry
						? editingEntry.status === "pago"
							? "view"
							: "edit"
						: "create"
				}
				entry={editingEntry}
				onSaved={() => void load()}
			/>

			<Dialog.Root
				open={baixarOpen}
				onOpenChange={(e) => setBaixarOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>Baixar lançamento</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Stack gap={4}>
								<Text fontSize="sm" color="fg.muted">
									Aberto: {selected ? formatMoney(selected.valorAberto) : "—"}
								</Text>
								<Field.Root required>
									<Field.Label>Valor</Field.Label>
									<MoneyInput
										placeholder="R$ 0,00"
										value={baixarValor}
										onChange={setBaixarValor}
									/>
								</Field.Root>
								<Field.Root required>
									<Field.Label>Conta bancária</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={baixarBankId}
											onChange={(e) => setBaixarBankId(e.target.value)}
										>
											<option value="">Selecione…</option>
											{bancos.map((b) => (
												<option key={b.id} value={b.id}>
													{b.banco} — {b.conta}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
								<Field.Root required>
									<Field.Label>Data do pagamento</Field.Label>
									<Input
										type="date"
										value={baixarData}
										onChange={(e) => setBaixarData(e.target.value)}
									/>
								</Field.Root>
							</Stack>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Fechar</Button>
							</Dialog.ActionTrigger>
							<Button
								bg="helios.solid"
								color="helios.contrast"
								loading={baixarSaving}
								onClick={() => void handleBaixar()}
							>
								Confirmar baixa
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			<Dialog.Root
				open={cancelOpen}
				onOpenChange={(e) => setCancelOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>Cancelar lançamento</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma o cancelamento deste lançamento
								{selected?.documento ? (
									<>
										{" "}
										(<strong>{selected.documento}</strong>)
									</>
								) : null}
								?
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Voltar</Button>
							</Dialog.ActionTrigger>
							<Button colorPalette="orange" onClick={() => void handleCancel()}>
								Cancelar lançamento
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			<Dialog.Root
				open={deleteOpen}
				onOpenChange={(e) => setDeleteOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>Excluir lançamento</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica deste lançamento
								{selected?.documento ? (
									<>
										{" "}
										(<strong>{selected.documento}</strong>)
									</>
								) : null}
								?
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button colorPalette="red" onClick={() => void handleDelete()}>
								Excluir
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Stack>
	);
}
