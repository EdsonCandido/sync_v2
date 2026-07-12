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

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { toaster } from "@/components/ui/toaster";
import { UserFormDialog } from "@/components/usuarios/UserFormDialog";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { type Company, companiesApi } from "@/lib/companies-api";
import {
	type AppUser,
	type CreateUserInput,
	type UpdateUserInput,
	usersApi,
} from "@/lib/users-api";

const PERFIL_LABEL: Record<string, string> = {
	super: "Super",
	admin_empresa: "Admin empresa",
	cliente: "Cliente",
};

function UsersPageContent() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("usuarios");
	const { data: session } = authClient.useSession();
	const actorPerfil =
		(session?.user as { perfil?: string } | undefined)?.perfil ?? "cliente";
	const actorCompanyId =
		(session?.user as { companyId?: string | null } | undefined)?.companyId ??
		null;

	const canSetPassword =
		actorPerfil === "super" || actorPerfil === "admin_empresa";
	const canSetAtivo =
		actorPerfil === "super" || actorPerfil === "admin_empresa";
	const canSoftDelete = canSetAtivo && allowEdit;

	const [items, setItems] = useState<AppUser[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [companies, setCompanies] = useState<Company[]>([]);

	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
		"create",
	);
	const [selected, setSelected] = useState<AppUser | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await usersApi.list({
				q: search || undefined,
				page,
				pageSize,
			});
			setItems(result.items);
			setTotal(result.total);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao listar usuários",
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

	useEffect(() => {
		if (actorPerfil !== "super") return;
		void companiesApi
			.list({ page: 1, pageSize: 100 })
			.then((r) => setCompanies(r.items))
			.catch(() => setCompanies([]));
	}, [actorPerfil]);

	function canEditRow(user: AppUser) {
		if (!allowEdit) return false;
		if (actorPerfil === "super") return true;
		if (actorPerfil === "admin_empresa") {
			return user.perfil === "cliente" || user.perfil === "admin_empresa";
		}
		return user.perfil === "cliente";
	}

	async function handleSubmit(values: CreateUserInput | UpdateUserInput) {
		try {
			if (formMode === "create") {
				await usersApi.create(values as CreateUserInput);
				toaster.create({ title: "Usuário criado", type: "success" });
			} else if (formMode === "edit" && selected) {
				await usersApi.update(selected.id, values as UpdateUserInput);
				toaster.create({ title: "Usuário atualizado", type: "success" });
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
			await usersApi.remove(selected.id);
			toaster.create({ title: "Usuário desativado", type: "success" });
			setDeleteOpen(false);
			setSelected(null);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao desativar",
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
					Usuários
				</Heading>
				<Text color="fg.muted">Cadastro e gestão de acessos</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por nome, e-mail ou perfil…"
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
						Novo usuário
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum usuário encontrado.
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
								<Table.ColumnHeader>Perfil</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">E-mail</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Empresa</Table.ColumnHeader>
								<Table.ColumnHeader>Status</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((row) => (
								<Table.Row key={row.id}>
									<Table.Cell fontWeight="medium">{row.name}</Table.Cell>
									<Table.Cell>
										{PERFIL_LABEL[row.perfil] ?? row.perfil}
									</Table.Cell>
									<Table.Cell hideBelow="md">{row.email}</Table.Cell>
									<Table.Cell hideBelow="md">
										{row.companyName ?? "—"}
									</Table.Cell>
									<Table.Cell>{row.ativo ? "Ativo" : "Inativo"}</Table.Cell>
									<Table.Cell textAlign="end">
										<HStack gap={1} justify="flex-end">
											<Button
												size="xs"
												variant="ghost"
												onClick={() => {
													setSelected(row);
													setFormMode("view");
													setFormOpen(true);
												}}
											>
												Ver
											</Button>
											{canEditRow(row) && (
												<>
													<Button
														size="xs"
														variant="ghost"
														onClick={() => {
															setSelected(row);
															setFormMode("edit");
															setFormOpen(true);
														}}
													>
														Editar
													</Button>
													{canSoftDelete && row.ativo && (
														<Button
															size="xs"
															variant="ghost"
															colorPalette="red"
															onClick={() => {
																setSelected(row);
																setDeleteOpen(true);
															}}
														>
															Desativar
														</Button>
													)}
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

			<UserFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				user={selected}
				actorPerfil={actorPerfil}
				actorCompanyId={actorCompanyId}
				companies={companies}
				canSetPassword={canSetPassword}
				canSetAtivo={canSetAtivo}
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
							<Dialog.Title>Desativar usuário</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma desativação de <strong>{selected?.name}</strong>?
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button colorPalette="red" onClick={() => void handleDelete()}>
								Desativar
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Stack>
	);
}

export default function DashboardUsuarios() {
	return (
		<ModuleGate moduleKey="usuarios">
			<UsersPageContent />
		</ModuleGate>
	);
}
