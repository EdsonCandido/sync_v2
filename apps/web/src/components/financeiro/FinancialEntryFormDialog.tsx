import {
	Button,
	Dialog,
	Field,
	HStack,
	Input,
	NativeSelect,
	Stack,
	Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

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
	observacoes: string;
};

function todayIsoDate() {
	return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(value: string) {
	return value.slice(0, 10);
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
		observacoes: entry.observacoes ?? "",
	};
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
	const isEdit = mode === "edit" && !!entry;
	const [form, setForm] = useState<FormState>(() => buildEmptyForm(defaults));
	const [saving, setSaving] = useState(false);
	const [categories, setCategories] = useState<FinancialCategory[]>([]);
	const [centros, setCentros] = useState<CostCenter[]>([]);
	const [bancos, setBancos] = useState<BankAccount[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);

	useEffect(() => {
		if (!open) return;
		setForm(
			isEdit && entry
				? buildFormFromEntry(entry)
				: buildEmptyForm({
						kanbanCardId: defaults?.kanbanCardId,
						originLabel: defaults?.originLabel,
						clientId: defaults?.clientId,
						originType: defaults?.originType,
					}),
		);
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
	}, [
		open,
		kind,
		isEdit,
		entry,
		defaults?.kanbanCardId,
		defaults?.originLabel,
		defaults?.clientId,
		defaults?.originType,
	]);

	function notifySaved() {
		if (onSaved) onSaved();
		else onCreated?.();
	}

	async function handleSave() {
		if (!form.dataEmissao || !form.dataVencimento) {
			toaster.create({ title: "Datas obrigatórias", type: "error" });
			return;
		}

		if (isEdit && entry) {
			setSaving(true);
			try {
				await financeiroApi.updateLancamento(entry.id, {
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
			await financeiroApi.createLancamento({
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
			});
			toaster.create({
				title:
					kind === "receber"
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

	const showOriginFields =
		isEdit || defaults?.originType !== "kanban";

	return (
		<Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" maxW="640px">
					<Dialog.Header>
						<Dialog.Title>{title}</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
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
															originType: e.target.value as
																| "avulsa"
																| "manual",
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

							<HStack gap={3} align="flex-start">
								<Field.Root flex="1">
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
								<Field.Root flex="1">
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
