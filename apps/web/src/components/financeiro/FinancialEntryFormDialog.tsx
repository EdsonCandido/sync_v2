import {
	Button,
	Dialog,
	Field,
	HStack,
	Input,
	NativeSelect,
	RadioGroup,
	Stack,
	Table,
	Text,
	Textarea,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import { MoneyInput } from "@/components/ui/money-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { type Client, clientsApi } from "@/lib/clients-api";
import {
	type BankAccount,
	type CostCenter,
	type FinancialCategory,
	type FinancialEntry,
	financeiroApi,
	formatDate,
	formatMoney,
	type Supplier,
} from "@/lib/financeiro-api";
import { numberToMoneyInput, parseMoneyInput } from "@/lib/money";

export type FinancialEntryFormDefaults = Partial<{
	kanbanCardId: string;
	originLabel: string;
	clientId: string;
	originType: "avulsa" | "kanban" | "manual";
}>;

type FinancialEntryFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	kind: "receber" | "pagar";
	mode?: "create" | "edit";
	entry?: FinancialEntry | null;
	defaults?: FinancialEntryFormDefaults;
	onCreated?: () => void;
	onSaved?: () => void;
};

type ParcelamentoModo = "dividir" | "repetir";

type FormState = {
	valorOriginal: string;
	dataEmissao: string;
	dataVencimento: string;
	originType: "avulsa" | "manual";
	originLabel: string;
	categoryId: string;
	costCenterId: string;
	bankAccountId: string;
	clientId: string;
	supplierId: string;
	documento: string;
	numero: string;
	parcelas: string;
	parcelamentoModo: ParcelamentoModo;
	observacoes: string;
};

const STATUS_LABEL: Record<FinancialEntry["status"], string> = {
	em_aberto: "Em aberto",
	parcial: "Parcial",
	pago: "Pago",
	cancelado: "Cancelado",
	vencido: "Vencido",
};

function todayIsoDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function toDateInputValue(value: string) {
	return value.slice(0, 10);
}

function round2(n: number) {
	return Math.round(n * 100) / 100;
}

function addMonthsIso(iso: string, months: number) {
	const [year, month, day] = iso.split("-").map(Number);
	const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
	date.setMonth(date.getMonth() + months);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function installmentValues(
	totalLiquido: number,
	parcelas: number,
	modo: ParcelamentoModo,
): number[] {
	if (modo === "repetir") {
		const unit = round2(totalLiquido);
		return Array.from({ length: parcelas }, () => unit);
	}
	const base = round2(totalLiquido / parcelas);
	const valores = Array.from({ length: parcelas }, () => base);
	const soma = round2(valores.reduce((a, b) => a + b, 0));
	const lastIndex = parcelas - 1;
	const lastValor = valores[lastIndex] ?? base;
	valores[lastIndex] = round2(lastValor + (totalLiquido - soma));
	return valores;
}

function buildEmptyForm(defaults?: FinancialEntryFormDefaults): FormState {
	const today = todayIsoDate();
	return {
		valorOriginal: "",
		dataEmissao: today,
		dataVencimento: today,
		originType:
			defaults?.originType === "kanban"
				? "manual"
				: ((defaults?.originType as "avulsa" | "manual" | undefined) ??
					"avulsa"),
		originLabel: defaults?.originLabel ?? "",
		categoryId: "",
		costCenterId: "",
		bankAccountId: "",
		clientId: defaults?.clientId ?? "",
		supplierId: "",
		documento: "",
		numero: "",
		parcelas: "1",
		parcelamentoModo: "dividir",
		observacoes: "",
	};
}

function buildFormFromEntry(entry: FinancialEntry): FormState {
	return {
		valorOriginal: numberToMoneyInput(entry.valorOriginal),
		dataEmissao: toDateInputValue(entry.dataEmissao),
		dataVencimento: toDateInputValue(entry.dataVencimento),
		originType: entry.originType === "manual" ? "manual" : "avulsa",
		originLabel: entry.originLabel ?? "",
		categoryId: entry.categoryId ?? "",
		costCenterId: entry.costCenterId ?? "",
		bankAccountId: entry.bankAccountId ?? "",
		clientId: entry.clientId ?? "",
		supplierId: entry.supplierId ?? "",
		documento: entry.documento ?? "",
		numero: entry.numero ?? "",
		parcelas: String(entry.installmentTotal ?? 1),
		parcelamentoModo: "dividir",
		observacoes: entry.observacoes ?? "",
	};
}

function formsEqual(a: FormState, b: FormState) {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function FinancialEntryFormDialog({
	open,
	onOpenChange,
	kind,
	mode = "create",
	entry = null,
	defaults,
	onCreated,
	onSaved,
}: FinancialEntryFormDialogProps) {
	const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
	const [activeEntry, setActiveEntry] = useState<FinancialEntry | null>(null);
	const isEdit = mode === "edit" && !!(activeEntry ?? entry);
	const currentEntry = activeEntry ?? entry;
	const [form, setForm] = useState<FormState>(() => buildEmptyForm(defaults));
	const [saving, setSaving] = useState(false);
	const [switching, setSwitching] = useState(false);
	const [groupItems, setGroupItems] = useState<FinancialEntry[]>([]);
	const [categories, setCategories] = useState<FinancialCategory[]>([]);
	const [centros, setCentros] = useState<CostCenter[]>([]);
	const [bancos, setBancos] = useState<BankAccount[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	useEffect(() => {
		if (!open) {
			setActiveEntryId(null);
			setActiveEntry(null);
			setGroupItems([]);
			return;
		}
		if (mode === "edit" && entry?.id) {
			setActiveEntryId(entry.id);
		} else {
			setActiveEntryId(null);
		}
	}, [open, mode, entry?.id]);

	useEffect(() => {
		if (!open || mode !== "edit" || !activeEntryId) return;
		let cancelled = false;
		setSwitching(true);
		void (async () => {
			try {
				const loaded = await financeiroApi.getLancamento(activeEntryId);
				if (cancelled) return;
				setActiveEntry(loaded);
				setForm(buildFormFromEntry(loaded));
			} catch (error) {
				if (cancelled) return;
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Erro ao abrir parcela",
					type: "error",
				});
			} finally {
				if (!cancelled) setSwitching(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [open, mode, activeEntryId]);

	useEffect(() => {
		if (!open || mode === "edit") return;
		setForm(
			buildEmptyForm({
				kanbanCardId: defaults?.kanbanCardId,
				originLabel: defaults?.originLabel,
				clientId: defaults?.clientId,
				originType: defaults?.originType,
			}),
		);
	}, [
		open,
		mode,
		defaults?.kanbanCardId,
		defaults?.originLabel,
		defaults?.clientId,
		defaults?.originType,
	]);

	useEffect(() => {
		if (!open) return;
		void (async () => {
			try {
				const tipo = kind === "receber" ? "receita" : "despesa";
				const [cats, cents, banks] = await Promise.all([
					financeiroApi.listCategorias({ tipo, pageSize: 100 }),
					financeiroApi.listCentros({ pageSize: 100 }),
					financeiroApi.listBancos({ pageSize: 100 }),
				]);
				setCategories(cats.items);
				setCentros(cents.items);
				setBancos(banks.items);

				if (kind === "receber") {
					const clientsResult = await clientsApi.list({ pageSize: 100 });
					setClients(clientsResult.items);
				} else {
					const suppliersResult = await financeiroApi.listFornecedores({
						pageSize: 100,
					});
					setSuppliers(suppliersResult.items);
				}
			} catch (error) {
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Erro ao carregar opções",
					type: "error",
				});
			}
		})();
	}, [open, kind]);

	useEffect(() => {
		if (!open || mode !== "edit" || !currentEntry?.installmentGroupId) {
			setGroupItems([]);
			return;
		}
		const groupId = currentEntry.installmentGroupId;
		let cancelled = false;
		void (async () => {
			try {
				const result = await financeiroApi.listLancamentosGrupo(groupId);
				if (!cancelled) setGroupItems(result.items);
			} catch (error) {
				if (cancelled) return;
				setGroupItems([]);
				toaster.create({
					title:
						error instanceof ApiError
							? error.message
							: "Erro ao carregar parcelas",
					type: "error",
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [open, mode, currentEntry?.installmentGroupId]);

	const parcelasCount = Math.max(1, Number(form.parcelas) || 1);
	const showParcelamento = !isEdit && parcelasCount > 1;
	const previewRows = useMemo(() => {
		if (!showParcelamento) return [];
		const valor = parseMoneyInput(form.valorOriginal);
		if (!valor || valor <= 0 || !form.dataVencimento) return [];
		const valores = installmentValues(
			valor,
			parcelasCount,
			form.parcelamentoModo,
		);
		return valores.map((parcelaValor, index) => ({
			numero: index + 1,
			vencimento: addMonthsIso(form.dataVencimento, index),
			valor: parcelaValor,
		}));
	}, [
		showParcelamento,
		form.valorOriginal,
		form.dataVencimento,
		form.parcelamentoModo,
		parcelasCount,
	]);
	const previewTotal = round2(previewRows.reduce((a, r) => a + r.valor, 0));

	function notifySaved() {
		if (onSaved) onSaved();
		else onCreated?.();
	}

	async function switchToEntry(next: FinancialEntry) {
		if (!currentEntry || next.id === currentEntry.id) return;
		if (next.id === activeEntryId) return;
		const dirty = !formsEqual(form, buildFormFromEntry(currentEntry));
		if (
			dirty &&
			!window.confirm(
				"Há alterações não salvas. Trocar de parcela mesmo assim?",
			)
		) {
			return;
		}
		setActiveEntryId(next.id);
	}

	async function handleSave() {
		if (!form.dataEmissao || !form.dataVencimento) {
			toaster.create({ title: "Datas obrigatórias", type: "error" });
			return;
		}

		if (isEdit && currentEntry) {
			setSaving(true);
			try {
				await financeiroApi.updateLancamento(currentEntry.id, {
					originLabel: form.originLabel.trim() || null,
					clientId: kind === "receber" ? form.clientId || null : null,
					supplierId: kind === "pagar" ? form.supplierId || null : null,
					categoryId: form.categoryId || null,
					costCenterId: form.costCenterId || null,
					bankAccountId: form.bankAccountId || null,
					documento: form.documento.trim() || null,
					numero: form.numero.trim() || null,
					dataEmissao: form.dataEmissao,
					dataVencimento: form.dataVencimento,
					observacoes: form.observacoes.trim() || null,
				});
				toaster.create({
					title:
						kind === "receber"
							? "Conta a receber atualizada"
							: "Conta a pagar atualizada",
					type: "success",
				});
				onOpenChange(false);
				notifySaved();
			} catch (error) {
				toaster.create({
					title: error instanceof ApiError ? error.message : "Erro ao salvar",
					type: "error",
				});
			} finally {
				setSaving(false);
			}
			return;
		}

		const valorOriginal = parseMoneyInput(form.valorOriginal);
		if (!valorOriginal || valorOriginal <= 0) {
			toaster.create({ title: "Valor original inválido", type: "error" });
			return;
		}
		const parcelas = Math.max(1, Number(form.parcelas) || 1);
		setSaving(true);
		try {
			const originType =
				defaults?.originType === "kanban" ? "kanban" : form.originType;
			const created = await financeiroApi.createLancamento({
				kind,
				originType,
				originLabel: form.originLabel.trim() || null,
				kanbanCardId: defaults?.kanbanCardId ?? null,
				clientId: kind === "receber" ? form.clientId || null : null,
				supplierId: kind === "pagar" ? form.supplierId || null : null,
				categoryId: form.categoryId || null,
				costCenterId: form.costCenterId || null,
				bankAccountId: form.bankAccountId || null,
				documento: form.documento.trim() || null,
				numero: form.numero.trim() || null,
				valorOriginal,
				dataEmissao: form.dataEmissao,
				dataVencimento: form.dataVencimento,
				observacoes: form.observacoes.trim() || null,
				parcelas,
				parcelamentoModo: parcelas > 1 ? form.parcelamentoModo : undefined,
			});
			const createdCount =
				created &&
				typeof created === "object" &&
				"items" in created &&
				Array.isArray(created.items)
					? created.items.length
					: 1;
			toaster.create({
				title:
					createdCount > 1
						? `${createdCount} parcelas criadas`
						: kind === "receber"
							? "Conta a receber criada"
							: "Conta a pagar criada",
				type: "success",
			});
			onOpenChange(false);
			notifySaved();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	const title = isEdit
		? kind === "receber"
			? "Editar conta a receber"
			: "Editar conta a pagar"
		: kind === "receber"
			? "Nova conta a receber"
			: "Nova conta a pagar";

	const showOriginFields = isEdit || defaults?.originType !== "kanban";
	const showGroup = isEdit && groupItems.length > 1;

	return (
		<Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" maxW={showGroup ? "3xl" : "640px"}>
					<Dialog.Header>
						<Dialog.Title>{title}</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							{showGroup ? (
								<Stack gap={2}>
									<Text fontWeight="medium">Parcelas do grupo</Text>
									<Table.ScrollArea maxH="220px">
										<Table.Root size="sm" stickyHeader>
											<Table.Header>
												<Table.Row>
													<Table.ColumnHeader>Nº</Table.ColumnHeader>
													<Table.ColumnHeader>Vencimento</Table.ColumnHeader>
													<Table.ColumnHeader textAlign="end">
														Valor
													</Table.ColumnHeader>
													<Table.ColumnHeader>Status</Table.ColumnHeader>
												</Table.Row>
											</Table.Header>
											<Table.Body>
												{groupItems.map((item) => {
													const current = item.id === activeEntryId;
													return (
														<Table.Row
															key={item.id}
															cursor={current ? "default" : "pointer"}
															bg={current ? "bg.muted" : undefined}
															opacity={switching ? 0.7 : 1}
															onClick={() => void switchToEntry(item)}
														>
															<Table.Cell>
																{`${item.installmentNumber ?? "—"}/${item.installmentTotal ?? "—"}`}
															</Table.Cell>
															<Table.Cell>
																{formatDate(item.dataVencimento)}
															</Table.Cell>
															<Table.Cell textAlign="end">
																{formatMoney(item.valorOriginal)}
															</Table.Cell>
															<Table.Cell>
																{STATUS_LABEL[item.status] ?? item.status}
															</Table.Cell>
														</Table.Row>
													);
												})}
											</Table.Body>
										</Table.Root>
									</Table.ScrollArea>
								</Stack>
							) : null}

							<HStack gap={3} align="flex-start">
								<Field.Root required={!isEdit} flex="1">
									<Field.Label>Valor original</Field.Label>
									<MoneyInput
										placeholder="R$ 0,00"
										value={form.valorOriginal}
										disabled={isEdit}
										onChange={(valorOriginal) =>
											setForm((f) => ({ ...f, valorOriginal }))
										}
									/>
								</Field.Root>
								{!isEdit && (
									<Field.Root flex="1">
										<Field.Label>Parcelas</Field.Label>
										<Input
											type="number"
											min="1"
											value={form.parcelas}
											onChange={(e) =>
												setForm((f) => ({ ...f, parcelas: e.target.value }))
											}
										/>
									</Field.Root>
								)}
							</HStack>

							{showParcelamento ? (
								<Field.Root>
									<Field.Label>Como aplicar o valor</Field.Label>
									<RadioGroup.Root
										value={form.parcelamentoModo}
										onValueChange={(e) => {
											const value = e.value;
											if (value !== "dividir" && value !== "repetir") return;
											setForm((f) => ({ ...f, parcelamentoModo: value }));
										}}
									>
										<Stack gap={2}>
											<RadioGroup.Item value="dividir">
												<HStack gap={2}>
													<RadioGroup.ItemHiddenInput />
													<RadioGroup.ItemIndicator />
													<RadioGroup.ItemText>
														Dividir valor entre as parcelas
													</RadioGroup.ItemText>
												</HStack>
											</RadioGroup.Item>
											<RadioGroup.Item value="repetir">
												<HStack gap={2}>
													<RadioGroup.ItemHiddenInput />
													<RadioGroup.ItemIndicator />
													<RadioGroup.ItemText>
														Repetir o mesmo valor em cada parcela
													</RadioGroup.ItemText>
												</HStack>
											</RadioGroup.Item>
										</Stack>
									</RadioGroup.Root>
								</Field.Root>
							) : null}

							{previewRows.length > 0 ? (
								<Stack gap={2}>
									<Text fontWeight="medium">Preview das parcelas</Text>
									<Table.ScrollArea maxH="180px">
										<Table.Root size="sm">
											<Table.Header>
												<Table.Row>
													<Table.ColumnHeader>Nº</Table.ColumnHeader>
													<Table.ColumnHeader>Vencimento</Table.ColumnHeader>
													<Table.ColumnHeader textAlign="end">
														Valor
													</Table.ColumnHeader>
												</Table.Row>
											</Table.Header>
											<Table.Body>
												{previewRows.map((row) => (
													<Table.Row key={row.numero}>
														<Table.Cell>
															{`${row.numero}/${parcelasCount}`}
														</Table.Cell>
														<Table.Cell>
															{formatDate(row.vencimento)}
														</Table.Cell>
														<Table.Cell textAlign="end">
															{formatMoney(row.valor)}
														</Table.Cell>
													</Table.Row>
												))}
											</Table.Body>
										</Table.Root>
									</Table.ScrollArea>
									<Text fontSize="sm" color="fg.muted">
										Total do grupo: {formatMoney(previewTotal)}
									</Text>
								</Stack>
							) : null}

							<HStack gap={3} align="flex-start">
								<Field.Root required flex="1">
									<Field.Label>Data de emissão</Field.Label>
									<Input
										type="date"
										value={form.dataEmissao}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												dataEmissao: e.target.value,
											}))
										}
									/>
								</Field.Root>
								<Field.Root required flex="1">
									<Field.Label>Data de vencimento</Field.Label>
									<Input
										type="date"
										value={form.dataVencimento}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												dataVencimento: e.target.value,
											}))
										}
									/>
								</Field.Root>
							</HStack>

							{showOriginFields &&
								(isEdit ? (
									<Field.Root>
										<Field.Label>Rótulo da origem</Field.Label>
										<Input
											value={form.originLabel}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													originLabel: e.target.value,
												}))
											}
										/>
									</Field.Root>
								) : (
									<HStack gap={3} align="flex-start">
										<Field.Root flex="1">
											<Field.Label>Tipo de origem</Field.Label>
											<NativeSelect.Root>
												<NativeSelect.Field
													value={form.originType}
													onChange={(e) =>
														setForm((f) => ({
															...f,
															originType: e.target.value as "avulsa" | "manual",
														}))
													}
												>
													<option value="avulsa">Avulsa</option>
													<option value="manual">Manual</option>
												</NativeSelect.Field>
											</NativeSelect.Root>
										</Field.Root>
										<Field.Root flex="1">
											<Field.Label>Rótulo da origem</Field.Label>
											<Input
												value={form.originLabel}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														originLabel: e.target.value,
													}))
												}
											/>
										</Field.Root>
									</HStack>
								))}

							{kind === "receber" ? (
								<Field.Root>
									<Field.Label>Cliente</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={form.clientId}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													clientId: e.target.value,
												}))
											}
										>
											<option value="">Sem cliente</option>
											{clients.map((c) => (
												<option key={c.id} value={c.id}>
													{c.personType === "PJ"
														? (c.tradeName ?? c.name)
														: c.name}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
							) : (
								<Field.Root>
									<Field.Label>Fornecedor</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={form.supplierId}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													supplierId: e.target.value,
												}))
											}
										>
											<option value="">Sem fornecedor</option>
											{suppliers.map((s) => (
												<option key={s.id} value={s.id}>
													{s.name}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
							)}

							<Field.Root>
								<Field.Label>Categoria</Field.Label>
								<NativeSelect.Root>
									<NativeSelect.Field
										value={form.categoryId}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												categoryId: e.target.value,
											}))
										}
									>
										<option value="">Sem categoria</option>
										{categories.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</NativeSelect.Field>
								</NativeSelect.Root>
							</Field.Root>

							<HStack gap={3} align="flex-start">
								<Field.Root flex="1">
									<Field.Label>Centro de custo</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={form.costCenterId}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													costCenterId: e.target.value,
												}))
											}
										>
											<option value="">Sem centro</option>
											{centros.map((c) => (
												<option key={c.id} value={c.id}>
													{c.codigo} — {c.name}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
								<Field.Root flex="1">
									<Field.Label>Conta bancária</Field.Label>
									<NativeSelect.Root>
										<NativeSelect.Field
											value={form.bankAccountId}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													bankAccountId: e.target.value,
												}))
											}
										>
											<option value="">Sem conta</option>
											{bancos.map((b) => (
												<option key={b.id} value={b.id}>
													{b.banco} — {b.conta}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								</Field.Root>
							</HStack>

							<HStack gap={3} align="flex-start" flexWrap="wrap">
								<Field.Root flex="1" minW="140px">
									<Field.Label>Documento</Field.Label>
									<Input
										value={form.documento}
										onChange={(e) =>
											setForm((f) => ({
												...f,
												documento: e.target.value,
											}))
										}
									/>
								</Field.Root>
								<Field.Root flex="1" minW="140px">
									<Field.Label>Número</Field.Label>
									<Input
										value={form.numero}
										onChange={(e) =>
											setForm((f) => ({ ...f, numero: e.target.value }))
										}
									/>
								</Field.Root>
							</HStack>

							<Field.Root>
								<Field.Label>Observações</Field.Label>
								<Textarea
									value={form.observacoes}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											observacoes: e.target.value,
										}))
									}
									rows={3}
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
	);
}
