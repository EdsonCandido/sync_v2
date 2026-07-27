import {
	Button,
	Dialog,
	Heading,
	HStack,
	IconButton,
	Input,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { LuDownload, LuTrash2 } from "react-icons/lu";
import { Link } from "react-router";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { ItrFormDialog } from "@/components/itr/ItrFormDialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { formatCpf } from "@/lib/cpf";
import {
	type CreateItrProcessInput,
	ITR_FILE_KIND_LABELS,
	type ItrProcess,
	itrApi,
} from "@/lib/itr-api";

function formatMoney(value: number) {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function ItrPageContent() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("itr");

	const [items, setItems] = useState<ItrProcess[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	const [formOpen, setFormOpen] = useState(false);
	const [detail, setDetail] = useState<ItrProcess | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selected, setSelected] = useState<ItrProcess | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const result = await itrApi.list({
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
						: "Erro ao listar processos ITR",
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

	async function handleCreate(
		values: CreateItrProcessInput,
		files: {
			declaracao: File | null;
			recibo: File | null;
			anexos: File[];
		},
	) {
		try {
			await itrApi.create(values, files);
			toaster.create({ title: "Processo ITR criado", type: "success" });
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
			await itrApi.remove(selected.id);
			toaster.create({ title: "Processo excluído", type: "success" });
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

	async function handleDownload(
		processId: string,
		fileId: string,
		name: string,
	) {
		try {
			const { blob, filename } = await itrApi.downloadFile(processId, fileId);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename || name;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao baixar arquivo",
				type: "error",
			});
		}
	}

	async function handleUploadExtra(processId: string, file: File) {
		try {
			await itrApi.uploadFile(processId, file);
			toaster.create({ title: "Arquivo enviado", type: "success" });
			const updated = await itrApi.find(processId);
			setDetail(updated);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro no upload",
				type: "error",
			});
		}
	}

	async function handleRemoveFile(processId: string, fileId: string) {
		try {
			await itrApi.removeFile(processId, fileId);
			toaster.create({ title: "Arquivo removido", type: "success" });
			const updated = await itrApi.find(processId);
			setDetail(updated);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao remover",
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
					ITR
				</Heading>
				<Text color="fg.muted">
					Processos ITR com arquivos, financeiro e kanban
				</Text>
			</Stack>

			<HStack
				gap={3}
				flexDir={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Input
					placeholder="Pesquisar por nome ou CPF…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
					maxW={{ md: "360px" }}
				/>
				{allowEdit && (
					<Button
						bg="helios.solid"
						color="helios.contrast"
						onClick={() => setFormOpen(true)}
						ml={{ md: "auto" }}
					>
						Novo ITR
					</Button>
				)}
			</HStack>

			{loading ? (
				<HStack justify="center" py={10}>
					<Spinner />
				</HStack>
			) : items.length === 0 ? (
				<Text color="fg.muted" py={8}>
					Nenhum processo ITR encontrado.
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
								<Table.ColumnHeader>Cliente</Table.ColumnHeader>
								<Table.ColumnHeader>CPF</Table.ColumnHeader>
								<Table.ColumnHeader>Valor</Table.ColumnHeader>
								<Table.ColumnHeader>Status</Table.ColumnHeader>
								<Table.ColumnHeader hideBelow="md">Arquivos</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{items.map((item) => (
								<Table.Row key={item.id}>
									<Table.Cell fontWeight="medium">{item.clientName}</Table.Cell>
									<Table.Cell>{formatCpf(item.clientDocument)}</Table.Cell>
									<Table.Cell>{formatMoney(item.valor)}</Table.Cell>
									<Table.Cell>{item.columnName}</Table.Cell>
									<Table.Cell hideBelow="md">{item.files.length}</Table.Cell>
									<Table.Cell textAlign="end">
										<HStack gap={1} justify="flex-end">
											<Button
												size="xs"
												variant="ghost"
												onClick={() => setDetail(item)}
											>
												Ver
											</Button>
											<Button size="xs" variant="ghost" asChild>
												<Link to="/dashboard/kanban">Kanban</Link>
											</Button>
											{allowEdit && (
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

			<ItrFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSubmit={handleCreate}
			/>

			<Dialog.Root
				open={!!detail}
				onOpenChange={(e) => {
					if (!e.open) setDetail(null);
				}}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content bg="bg.panel" maxW="md" mx={4}>
						<Dialog.Header>
							<Dialog.Title>{detail?.clientName}</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							{detail && (
								<Stack gap={3}>
									<Text fontSize="sm" color="fg.muted">
										CPF {formatCpf(detail.clientDocument)} ·{" "}
										{formatMoney(detail.valor)} · {detail.columnName}
									</Text>
									<Stack gap={2}>
										{detail.files.map((file) => (
											<HStack key={file.id} justify="space-between">
												<Text fontSize="sm" truncate maxW="60%">
													{ITR_FILE_KIND_LABELS[file.kind] ?? "Arquivo"}:{" "}
													{file.originalName}
												</Text>
												<HStack>
													<IconButton
														size="xs"
														variant="ghost"
														aria-label="Baixar"
														onClick={() =>
															void handleDownload(
																detail.id,
																file.id,
																file.originalName,
															)
														}
													>
														<LuDownload />
													</IconButton>
													{allowEdit && (
														<IconButton
															size="xs"
															variant="ghost"
															colorPalette="red"
															aria-label="Remover"
															onClick={() =>
																void handleRemoveFile(detail.id, file.id)
															}
														>
															<LuTrash2 />
														</IconButton>
													)}
												</HStack>
											</HStack>
										))}
									</Stack>
									{allowEdit && (
										<Input
											type="file"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) void handleUploadExtra(detail.id, file);
												e.target.value = "";
											}}
										/>
									)}
								</Stack>
							)}
						</Dialog.Body>
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
							<Dialog.Title>Excluir processo ITR</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								Confirma exclusão lógica de{" "}
								<strong>{selected?.clientName}</strong>?
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

export default function DashboardItr() {
	return (
		<ModuleGate moduleKey="itr">
			<ItrPageContent />
		</ModuleGate>
	);
}
