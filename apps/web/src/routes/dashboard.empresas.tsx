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
import { useNavigate } from "react-router";

import { CompanyFormDialog } from "@/components/empresas/CompanyFormDialog";
import { CompanyModulesDialog } from "@/components/empresas/CompanyModulesDialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type Company,
	type CompanyInput,
	companiesApi,
	type Plan,
	plansApi,
} from "@/lib/companies-api";

export default function DashboardEmpresas() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;

	const [items, setItems] = useState<Company[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [plans, setPlans] = useState<Plan[]>([]);

	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
		"create",
	);
	const [selected, setSelected] = useState<Company | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [modulesOpen, setModulesOpen] = useState(false);

	useEffect(() => {
		if (sessionPending) return;
		if (perfil !== "super") {
			navigate("/dashboard", { replace: true });
		}
	}, [perfil, sessionPending, navigate]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await companiesApi.list({
				q: search || undefined,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar empresas",
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
		if (perfil !== "super") return;
		void plansApi
			.options()
			.then(setPlans)
			.catch(() => {
				toaster.create({ title: "Erro ao carregar planos", type: "error" });
			});
	}, [perfil]);

	useEffect(() => {
		const t = setTimeout(() => {
			setPage(1);
			setSearch(q.trim());
		}, 350);
		return () => clearTimeout(t);
	}, [q]);

	async function handleSubmit(values: CompanyInput) {
		try {
			if (formMode === "create") {
				await companiesApi.create(values);
				toaster.create({ title: "Empresa criada", type: "success" });
			} else if (formMode === "edit" && selected) {
				await companiesApi.update(selected.id, values);
				toaster.create({ title: "Empresa atualizada", type: "success" });
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
			await companiesApi.remove(selected.id);
			toaster.create({ title: "Empresa excluída", type: "success" });
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
					Empresas
				</Heading>
				<Text color="fg.muted">Cadastro e gestão de empresas</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por nome, CNPJ ou email…"
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
					Nova empresa
				</Button>
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhuma empresa encontrada.
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
								<Table.ColumnHeader>Nome Fantasia</Table.ColumnHeader>
								<Table.ColumnHeader>CNPJ</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Email</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Cidade</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((company) => (
								<Table.Row key={company.id}>
									<Table.Cell fontWeight="medium">
										{company.tradeName}
									</Table.Cell>
									<Table.Cell>{company.document}</Table.Cell>
									<Table.Cell hideBelow="md">{company.email}</Table.Cell>
									<Table.Cell hideBelow="md">
										{company.city}/{company.state}
									</Table.Cell>
									<Table.Cell textAlign="end">
										<HStack gap={1} justify="flex-end">
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(company);
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
													setSelected(company);
													setFormMode("edit");
													setFormOpen(true);
												}}
											>
												Editar
											</Button>
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(company);
													setModulesOpen(true);
												}}
											>
												Módulos
											</Button>
											<Button
												size="xs"
												variant="ghost"
												colorPalette="red"
												onClick={() => {
													setSelected(company);
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

			<CompanyFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				company={selected}
				plans={plans}
				onSubmit={handleSubmit}
			/>

			<CompanyModulesDialog
				open={modulesOpen}
				onOpenChange={setModulesOpen}
				company={selected}
			/>

			<Dialog.Root
				open={deleteOpen}
				onOpenChange={(e) => setDeleteOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel">
						<Dialog.Header>
							<Dialog.Title>Excluir empresa</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica de{" "}
								<strong>{selected?.tradeName}</strong>?
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
