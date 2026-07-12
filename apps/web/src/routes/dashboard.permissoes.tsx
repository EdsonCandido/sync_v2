import {
	Button,
	Checkbox,
	Heading,
	HStack,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type CompanyUserPermissions,
	type ModuleKey,
	type ModulePermissionItem,
	modulePermissionsApi,
} from "@/lib/module-permissions-api";

const MODULE_LABELS: Record<ModuleKey, string> = {
	clientes: "Clientes",
	financeiro: "Financeiro",
	kanban: "Kanban",
	usuarios: "Usuários",
};

const MODULE_KEYS: ModuleKey[] = [
	"clientes",
	"financeiro",
	"kanban",
	"usuarios",
];

export default function DashboardPermissoes() {
	const navigate = useNavigate();
	const { data: session, isPending: sessionPending } = authClient.useSession();
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;

	const [users, setUsers] = useState<CompanyUserPermissions[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingUserId, setSavingUserId] = useState<string | null>(null);
	const [drafts, setDrafts] = useState<Record<string, ModulePermissionItem[]>>(
		{},
	);

	useEffect(() => {
		if (sessionPending) return;
		if (perfil !== "admin_empresa") {
			navigate("/dashboard", { replace: true });
		}
	}, [perfil, sessionPending, navigate]);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await modulePermissionsApi.listUsers();
			setUsers(result);
			const next: Record<string, ModulePermissionItem[]> = {};
			for (const u of result) {
				next[u.userId] = MODULE_KEYS.map((moduleKey) => {
					const existing = u.modules.find((m) => m.moduleKey === moduleKey);
					return {
						moduleKey,
						canRead: Boolean(existing?.canRead || existing?.canEdit),
						canEdit: Boolean(existing?.canEdit),
					};
				});
			}
			setDrafts(next);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao listar permissões",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (perfil !== "admin_empresa") return;
		void load();
	}, [perfil, load]);

	function updateDraft(
		userId: string,
		moduleKey: ModuleKey,
		field: "canRead" | "canEdit",
		value: boolean,
	) {
		setDrafts((prev) => {
			const current = prev[userId] ?? [];
			return {
				...prev,
				[userId]: current.map((item) => {
					if (item.moduleKey !== moduleKey) return item;
					if (field === "canEdit") {
						return {
							...item,
							canEdit: value,
							canRead: value ? true : item.canRead,
						};
					}
					return {
						...item,
						canRead: value,
						canEdit: value ? item.canEdit : false,
					};
				}),
			};
		});
	}

	async function handleSave(userId: string) {
		const modules = drafts[userId];
		if (!modules) return;
		setSavingUserId(userId);
		try {
			const updated = await modulePermissionsApi.upsertUser(userId, modules);
			setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
			toaster.create({ title: "Permissões salvas", type: "success" });
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSavingUserId(null);
		}
	}

	if (sessionPending || perfil !== "admin_empresa") {
		return (
			<HStack justify="center" py={16}>
				<Spinner />
			</HStack>
		);
	}

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
					Permissões
				</Heading>
				<Text color="fg.muted">
					Defina leitura e edição por módulo para usuários da empresa
				</Text>
			</Stack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : users.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum usuário com perfil cliente nesta empresa.
				</Text>
			) : (
				<Stack gap={6}>
					{users.map((user) => {
						const modules = drafts[user.userId] ?? [];
						return (
							<Stack
								key={user.userId}
								gap={3}
								borderWidth="1px"
								borderColor="helios.border"
								rounded="md"
								p={4}
							>
								<Stack gap={0}>
									<Text fontWeight="semibold">{user.name}</Text>
									<Text fontSize="sm" color="fg.muted">
										{user.email}
									</Text>
								</Stack>

								<Table.ScrollArea>
									<Table.Root size="sm">
										<Table.Header>
											<Table.Row bg="bg.muted">
												<Table.ColumnHeader>Módulo</Table.ColumnHeader>
												<Table.ColumnHeader>Ler</Table.ColumnHeader>
												<Table.ColumnHeader>Editar</Table.ColumnHeader>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{modules.map((mod) => (
												<Table.Row key={mod.moduleKey}>
													<Table.Cell>
														{MODULE_LABELS[mod.moduleKey]}
													</Table.Cell>
													<Table.Cell>
														<Checkbox.Root
															checked={mod.canRead}
															onCheckedChange={(e) =>
																updateDraft(
																	user.userId,
																	mod.moduleKey,
																	"canRead",
																	Boolean(e.checked),
																)
															}
														>
															<Checkbox.HiddenInput />
															<Checkbox.Control />
														</Checkbox.Root>
													</Table.Cell>
													<Table.Cell>
														<Checkbox.Root
															checked={mod.canEdit}
															onCheckedChange={(e) =>
																updateDraft(
																	user.userId,
																	mod.moduleKey,
																	"canEdit",
																	Boolean(e.checked),
																)
															}
														>
															<Checkbox.HiddenInput />
															<Checkbox.Control />
														</Checkbox.Root>
													</Table.Cell>
												</Table.Row>
											))}
										</Table.Body>
									</Table.Root>
								</Table.ScrollArea>

								<HStack justify="flex-end">
									<Button
										size="sm"
										bg="helios.solid"
										color="helios.contrast"
										loading={savingUserId === user.userId}
										onClick={() => void handleSave(user.userId)}
									>
										Salvar
									</Button>
								</HStack>
							</Stack>
						);
					})}
				</Stack>
			)}
		</Stack>
	);
}
