import {
	Button,
	Dialog,
	Field,
	Heading,
	HStack,
	Input,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { financeiroApi, type Supplier } from "@/lib/financeiro-api";

type FormState = {
	name: string;
	document: string;
	email: string;
	phone: string;
};

const emptyForm: FormState = {
	name: "",
	document: "",
	email: "",
	phone: "",
};

export default function DashboardFinanceiroFornecedores() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("financeiro");

	const [items, setItems] = useState<Supplier[]>([]);
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
	const [selected, setSelected] = useState<Supplier | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await financeiroApi.listFornecedores({
				q: search || undefined,
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
						: "Erro ao listar fornecedores",
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
		setForm(emptyForm);
		setFormMode("create");
		setFormOpen(true);
	}

	function openEdit(item: Supplier) {
		setSelected(item);
		setForm({
			name: item.name,
			document: item.document ?? "",
			email: item.email ?? "",
			phone: item.phone ?? "",
		});
		setFormMode("edit");
		setFormOpen(true);
	}

	async function handleSave() {
		if (!form.name.trim()) {
			toaster.create({ title: "Nome obrigatório", type: "error" });
			return;
		}
		setSaving(true);
		try {
			const body = {
				name: form.name.trim(),
				document: form.document.trim() || null,
				email: form.email.trim() || null,
				phone: form.phone.trim() || null,
			};
			if (formMode === "create") {
				await financeiroApi.createFornecedor(body);
				toaster.create({ title: "Fornecedor criado", type: "success" });
			} else if (selected) {
				await financeiroApi.updateFornecedor(selected.id, body);
				toaster.create({ title: "Fornecedor atualizado", type: "success" });
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
			await financeiroApi.removeFornecedor(selected.id);
			toaster.create({ title: "Fornecedor excluído", type: "success" });
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
					Fornecedores
				</Heading>
				<Text color="fg.muted">Cadastro de fornecedores</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por nome, documento ou email…"
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
						Novo fornecedor
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum fornecedor encontrado.
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
								<Table.ColumnHeader>Nome</Table.ColumnHeader>
								<Table.ColumnHeader>Documento</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Email</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Telefone</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((item) => (
								<Table.Row key={item.id}>
									<Table.Cell fontWeight="medium">{item.name}</Table.Cell>
									<Table.Cell>{item.document ?? "—"}</Table.Cell>
									<Table.Cell hideBelow="md">{item.email ?? "—"}</Table.Cell>
									<Table.Cell hideBelow="md">{item.phone ?? "—"}</Table.Cell>
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
									? "Novo fornecedor"
									: "Editar fornecedor"}
							</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Stack gap={4}>
								<Field.Root required>
									<Field.Label>Nome</Field.Label>
									<Input
										value={form.name}
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
									/>
								</Field.Root>
								<Field.Root>
									<Field.Label>Documento</Field.Label>
									<Input
										value={form.document}
										onChange={(e) =>
											setForm((f) => ({ ...f, document: e.target.value }))
										}
									/>
								</Field.Root>
								<Field.Root>
									<Field.Label>Email</Field.Label>
									<Input
										type="email"
										value={form.email}
										onChange={(e) =>
											setForm((f) => ({ ...f, email: e.target.value }))
										}
									/>
								</Field.Root>
								<Field.Root>
									<Field.Label>Telefone</Field.Label>
									<Input
										value={form.phone}
										onChange={(e) =>
											setForm((f) => ({ ...f, phone: e.target.value }))
										}
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
							<Dialog.Title>Excluir fornecedor</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica de <strong>{selected?.name}</strong>?
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
