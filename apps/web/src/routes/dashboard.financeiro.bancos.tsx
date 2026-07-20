import {
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
import { useCallback, useEffect, useState } from "react";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { MoneyInput } from "@/components/ui/money-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type BankAccount,
	financeiroApi,
	formatMoney,
} from "@/lib/financeiro-api";
import { numberToMoneyInput, parseMoneyInput } from "@/lib/money";

type FormState = {
	banco: string;
	agencia: string;
	conta: string;
	tipo: BankAccount["tipo"];
	saldoInicial: string;
	dataSaldoInicial: string;
	cor: string;
};

function todayIsoDate() {
	return new Date().toISOString().slice(0, 10);
}

const emptyForm: FormState = {
	banco: "",
	agencia: "",
	conta: "",
	tipo: "corrente",
	saldoInicial: numberToMoneyInput(0),
	dataSaldoInicial: todayIsoDate(),
	cor: "#3b82f6",
};

const TIPO_LABEL: Record<BankAccount["tipo"], string> = {
	corrente: "Corrente",
	poupanca: "Poupança",
	investimento: "Investimento",
	outro: "Outro",
};

export default function DashboardFinanceiroBancos() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("financeiro");

	const [items, setItems] = useState<BankAccount[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [form, setForm] = useState<FormState>(emptyForm);
	const [saving, setSaving] = useState(false);
	const [selected, setSelected] = useState<BankAccount | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await financeiroApi.listBancos({
				q: search || undefined,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar bancos",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [search, page, pageSize]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1);
			setSearch(q.trim());
		}, 350);
		return () => clearTimeout(t);
	}, [q]);

	function openCreate() {
		setSelected(null);
		setForm({ ...emptyForm, dataSaldoInicial: todayIsoDate() });
		setFormMode("create");
		setFormOpen(true);
	}

	function openEdit(item: BankAccount) {
		setSelected(item);
		setForm({
			banco: item.banco,
			agencia: item.agencia,
			conta: item.conta,
			tipo: item.tipo,
			saldoInicial: numberToMoneyInput(item.saldoInicial),
			dataSaldoInicial: item.dataSaldoInicial?.slice(0, 10) || todayIsoDate(),
			cor: item.cor || "#3b82f6",
		});
		setFormMode("edit");
		setFormOpen(true);
	}

	async function handleSave() {
		if (!form.banco.trim() || !form.agencia.trim() || !form.conta.trim()) {
			toaster.create({
				title: "Banco, agência e conta são obrigatórios",
				type: "error",
			});
			return;
		}
		const saldoInicial = parseMoneyInput(form.saldoInicial);
		if (Number.isNaN(saldoInicial)) {
			toaster.create({ title: "Saldo inicial inválido", type: "error" });
			return;
		}
		setSaving(true);
		try {
			const body = {
				banco: form.banco.trim(),
				agencia: form.agencia.trim(),
				conta: form.conta.trim(),
				tipo: form.tipo,
				saldoInicial,
				dataSaldoInicial: form.dataSaldoInicial,
				cor: form.cor.trim() || "#3b82f6",
			};
			if (formMode === "create") {
				await financeiroApi.createBanco(body);
				toaster.create({ title: "Conta bancária criada", type: "success" });
			} else if (selected) {
				await financeiroApi.updateBanco(selected.id, body);
				toaster.create({
					title: "Conta bancária atualizada",
					type: "success",
				});
			}
			setFormOpen(false);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!selected) return;
		try {
			await financeiroApi.removeBanco(selected.id);
			toaster.create({ title: "Conta bancária excluída", type: "success" });
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
					Bancos
				</Heading>
				<Text color="fg.muted">Contas bancárias e saldos</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por banco, agência ou conta…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					maxW={{ md: "360px" }}
				/>
				{allowEdit && (
					<Button
						bg="helios.solid"
						color="helios.contrast"
						onClick={openCreate}
						ml={{ md: "auto" }}
					>
						Nova conta
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhuma conta bancária encontrada.
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
								<Table.ColumnHeader>Banco</Table.ColumnHeader>
								<Table.ColumnHeader>Agência</Table.ColumnHeader>
								<Table.ColumnHeader>Conta</Table.ColumnHeader>
								<Table.ColumnHeader>Tipo</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">
									Saldo atual
								</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((item) => (
								<Table.Row key={item.id}>
									<Table.Cell fontWeight="medium">{item.banco}</Table.Cell>
									<Table.Cell>{item.agencia}</Table.Cell>
									<Table.Cell>{item.conta}</Table.Cell>
									<Table.Cell>{TIPO_LABEL[item.tipo]}</Table.Cell>
									<Table.Cell textAlign="end">
										{formatMoney(item.saldoAtual)}
									</Table.Cell>
									<Table.Cell textAlign="end">
										{allowEdit && (
											<HStack gap={1} justify="flex-end">
												<Button
													size="xs"
													variant="ghost"
													onClick={() => openEdit(item)}
												>
													Editar
												</Button>
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
											</HStack>
										)}
									</Table.Cell>
								</Table.Row>
							))}
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

			<Dialog.Root open={formOpen} onOpenChange={(e) => setFormOpen(e.open)}>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>
								{formMode === "create"
									? "Nova conta bancária"
									: "Editar conta bancária"}
							</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Stack gap={4}>
								<Field.Root required>
									<Field.Label>Banco</Field.Label>
									<Input
										value={form.banco}
										onChange={(e) =>
											setForm((f) => ({ ...f, banco: e.target.value }))
										}
									/>
								</Field.Root>
								<HStack gap={3} align="flex-start">
									<Field.Root required flex="1">
										<Field.Label>Agência</Field.Label>
										<Input
											value={form.agencia}
											onChange={(e) =>
												setForm((f) => ({ ...f, agencia: e.target.value }))
											}
										/>
									</Field.Root>
									<Field.Root required flex="1">
										<Field.Label>Conta</Field.Label>
										<Input
											value={form.conta}
											onChange={(e) =>
												setForm((f) => ({ ...f, conta: e.target.value }))
											}
										/>
									</Field.Root>
								</HStack>
								<Field.Root required>
									<Field.Label>Tipo</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={form.tipo}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													tipo: e.target.value as BankAccount["tipo"],
												}))
											}
										>
											<option value="corrente">Corrente</option>
											<option value="poupanca">Poupança</option>
											<option value="investimento">Investimento</option>
											<option value="outro">Outro</option>
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
								<HStack gap={3} align="flex-start">
									<Field.Root required flex="1">
										<Field.Label>Saldo inicial</Field.Label>
										<MoneyInput
											placeholder="R$ 0,00"
											allowNegative
											value={form.saldoInicial}
											onChange={(saldoInicial) =>
												setForm((f) => ({ ...f, saldoInicial }))
											}
										/>
									</Field.Root>
									<Field.Root required flex="1">
										<Field.Label>Data do saldo inicial</Field.Label>
										<Input
											type="date"
											value={form.dataSaldoInicial}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													dataSaldoInicial: e.target.value,
												}))
											}
										/>
									</Field.Root>
								</HStack>
								<Field.Root>
									<Field.Label>Cor</Field.Label>
									<Input
										value={form.cor}
										onChange={(e) =>
											setForm((f) => ({ ...f, cor: e.target.value }))
										}
										placeholder="#3b82f6"
									/>
								</Field.Root>
							</Stack>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button
								bg="helios.solid"
								color="helios.contrast"
								loading={saving}
								onClick={() => void handleSave()}
							>
								Salvar
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
							<Dialog.Title>Excluir conta bancária</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica de <strong>{selected?.banco}</strong> (
								{selected?.agencia}/{selected?.conta})?
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
