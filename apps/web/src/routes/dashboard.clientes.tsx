import {
	Button,
	Dialog,
	Heading,
	HStack,
	Input,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { ClientFormDialog } from "@/components/clientes/ClientFormDialog";
import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { type Client, type ClientInput, clientsApi } from "@/lib/clients-api";

function ClientsPageContent() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("clientes");

	const [items, setItems] = useState<Client[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
		"create",
	);
	const [selected, setSelected] = useState<Client | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await clientsApi.list({
				q: search || undefined,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar clientes",
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

	async function handleSubmit(values: ClientInput) {
		try {
			if (formMode === "create") {
				await clientsApi.create(values);
				toaster.create({ title: "Cliente criado", type: "success" });
			} else if (formMode === "edit" && selected) {
				await clientsApi.update(selected.id, values);
				toaster.create({ title: "Cliente atualizado", type: "success" });
			}
			setFormOpen(false);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
			throw error;
		}
	}

	async function handleDelete() {
		if (!selected) return;
		try {
			await clientsApi.remove(selected.id);
			toaster.create({ title: "Cliente excluído", type: "success" });
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
					Módulo
				</Text>
				<Heading as="h1" size="xl" letterSpacing="-0.02em">
					Clientes
				</Heading>
				<Text color="fg.muted">Cadastro de pessoas físicas e jurídicas</Text>
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
						onClick={() => {
							setSelected(null);
							setFormMode("create");
							setFormOpen(true);
						}}
						ml={{ md: "auto" }}
					>
						Novo cliente
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum cliente encontrado.
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
								<Table.ColumnHeader>Tipo</Table.ColumnHeader>
								<Table.ColumnHeader>Documento</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Email</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Cidade</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((client) => (
								<Table.Row key={client.id}>
									<Table.Cell fontWeight="medium">
										{client.personType === "PJ"
											? (client.tradeName ?? client.name)
											: client.name}
									</Table.Cell>
									<Table.Cell>{client.personType}</Table.Cell>
									<Table.Cell>{client.document}</Table.Cell>
									<Table.Cell hideBelow="md">{client.email}</Table.Cell>
									<Table.Cell hideBelow="md">
										{client.city}/{client.state}
									</Table.Cell>
									<Table.Cell textAlign="end">
										<HStack gap={1} justify="flex-end">
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(client);
													setFormMode("view");
													setFormOpen(true);
												}}
											>
												Ver
											</Button>
											{allowEdit && (
												<>
													<Button
														size="xs"
														variant="ghost"
														onClick={() => {
															setSelected(client);
															setFormMode("edit");
															setFormOpen(true);
														}}
													>
														Editar
													</Button>
													<Button
														size="xs"
														variant="ghost"
														colorPalette="red"
														onClick={() => {
															setSelected(client);
															setDeleteOpen(true);
														}}
													>
														Excluir
													</Button>
												</>
											)}
										</HStack>
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

			<ClientFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				client={selected}
				onSubmit={handleSubmit}
			/>

			<Dialog.Root
				open={deleteOpen}
				onOpenChange={(e) => setDeleteOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>Excluir cliente</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica de{" "}
								<strong>
									{selected?.personType === "PJ"
										? (selected.tradeName ?? selected.name)
										: selected?.name}
								</strong>
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

export default function DashboardClientes() {
	return (
		<ModuleGate moduleKey="clientes">
			<ClientsPageContent />
		</ModuleGate>
	);
}
