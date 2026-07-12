import {
	Button,
	Dialog,
	HStack,
	Heading,
	Input,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PlanFormDialog } from "@/components/planos/PlanFormDialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type Plan,
	type PlanInput,
	plansApi,
} from "@/lib/plans-api";

function formatDate(value: string) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return value;
	return d.toLocaleDateString("pt-BR");
}

export default function DashboardPlanos() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;

	const [items, setItems] = useState<Plan[]>([]);
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
	const [selected, setSelected] = useState<Plan | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	useEffect(() => {
		if (sessionPending) return;
		if (perfil !== "super") {
			navigate("/dashboard", { replace: true });
		}
	}, [perfil, sessionPending, navigate]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await plansApi.list({
				q: search || undefined,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar planos",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [search, page, pageSize]);

	useEffect(() => {
		if (perfil !== "super") return;
		void load();
	}, [perfil, load]);

	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1);
			setSearch(q.trim());
		}, 350);
		return () => clearTimeout(t);
	}, [q]);

	async function handleSubmit(values: PlanInput) {
		try {
			if (formMode === "create") {
				await plansApi.create(values);
				toaster.create({ title: "Plano criado", type: "success" });
			} else if (formMode === "edit" && selected) {
				await plansApi.update(selected.id, values);
				toaster.create({ title: "Plano atualizado", type: "success" });
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
			await plansApi.remove(selected.id);
			toaster.create({ title: "Plano excluído", type: "success" });
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

	if (sessionPending || perfil !== "super") {
		return (
			<HStack justify="center" py={16}>
				<Spinner />
			</HStack>
		);
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
					Planos
				</Heading>
				<Text color="fg.muted">Cadastro e gestão de planos</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por nome ou descrição…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					maxW={{ md: "360px" }}
				/>
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
					Novo plano
				</Button>
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum plano encontrado.
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
								<Table.ColumnHeader hideBelow="md">
									Descrição
								</Table.ColumnHeader>
								<Table.ColumnHeader>Início</Table.ColumnHeader>
								<Table.ColumnHeader>Fim</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((plan) => (
								<Table.Row key={plan.id}>
									<Table.Cell fontWeight="medium">{plan.name}</Table.Cell>
									<Table.Cell hideBelow="md">
										{plan.description || "—"}
									</Table.Cell>
									<Table.Cell>{formatDate(plan.startDate)}</Table.Cell>
									<Table.Cell>{formatDate(plan.endDate)}</Table.Cell>
									<Table.Cell textAlign="end">
										<HStack gap={1} justify="flex-end">
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(plan);
													setFormMode("view");
													setFormOpen(true);
												}}
											>
												Ver
											</Button>
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(plan);
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
													setSelected(plan);
													setDeleteOpen(true);
												}}
											>
												Excluir
											</Button>
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

			<PlanFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				plan={selected}
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
							<Dialog.Title>Excluir plano</Dialog.Title>
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
