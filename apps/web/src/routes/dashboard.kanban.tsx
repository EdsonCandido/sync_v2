import {
	Button,
	Dialog,
	Field,
	Heading,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { isCardOverdue } from "@/components/kanban/columnAccent";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanCardDialog } from "@/components/kanban/KanbanCardDialog";
import { KanbanEmptyState } from "@/components/kanban/KanbanEmptyState";
import { KanbanErrorState } from "@/components/kanban/KanbanErrorState";
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton";
import { KanbanStatistics } from "@/components/kanban/KanbanStatistics";
import { KanbanToolbar } from "@/components/kanban/KanbanToolbar";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type KanbanBoard as KanbanBoardData,
	type KanbanCard,
	type KanbanSort,
	type KanbanTag,
	kanbanApi,
} from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };
type FilterClient = { id: string; name: string };

function KanbanPageContent() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("kanban");
	const { data: session } = authClient.useSession();
	const actorPerfil =
		(session?.user as { perfil?: string } | undefined)?.perfil ?? "cliente";
	const currentUserId = session?.user?.id ?? "";

	const [board, setBoard] = useState<KanbanBoardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [clients, setClients] = useState<FilterClient[]>([]);
	const [users, setUsers] = useState<FilterUser[]>([]);
	const [tags, setTags] = useState<KanbanTag[]>([]);

	const [q, setQ] = useState("");
	const [search, setSearch] = useState("");
	const [filterAssignee, setFilterAssignee] = useState("");
	const [filterClient, setFilterClient] = useState("");
	const [filterTag, setFilterTag] = useState("");
	const [sort, setSort] = useState<KanbanSort>("position");

	const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
	const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(
		null,
	);
	const [cardDialogOpen, setCardDialogOpen] = useState(false);
	const [cardMode, setCardMode] = useState<"create" | "edit">("create");
	const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
	const [createColumnId, setCreateColumnId] = useState<string | null>(null);

	const [newColumnOpen, setNewColumnOpen] = useState(false);
	const [newColumnName, setNewColumnName] = useState("");
	const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);

	const loadBoard = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await kanbanApi.getBoard({
				q: search || undefined,
				assigneeUserId: filterAssignee || undefined,
				clientId: filterClient || undefined,
				tagId: filterTag || undefined,
				sort,
			});
			setBoard(result);
		} catch (err) {
			const message =
				err instanceof ApiError ? err.message : "Erro ao carregar kanban";
			setError(message);
			toaster.create({ title: message, type: "error" });
		} finally {
			setLoading(false);
		}
	}, [search, filterAssignee, filterClient, filterTag, sort]);

	const loadFiltersData = useCallback(async () => {
		try {
			const options = await kanbanApi.getFilterOptions();
			setClients(options.clients);
			setUsers(options.assignees);
			setTags(options.tags);
		} catch {
			// filtros auxiliares
		}
	}, []);

	useEffect(() => {
		void loadBoard();
	}, [loadBoard]);

	useEffect(() => {
		void loadFiltersData();
	}, [loadFiltersData]);

	useEffect(() => {
		const t = setTimeout(() => setSearch(q.trim()), 300);
		return () => clearTimeout(t);
	}, [q]);

	const stats = useMemo(() => {
		const columns = board?.columns ?? [];
		const allCards = columns.flatMap((c) =>
			c.cards.map((card) => ({ card, slug: c.slug })),
		);
		return {
			total: allCards.length,
			inProgress: allCards.filter((x) => x.slug === "em_execucao").length,
			done: allCards.filter((x) => x.slug === "concluido").length,
			overdue: allCards.filter((x) => isCardOverdue(x.card.dueAt, x.slug))
				.length,
			mine: allCards.filter((x) =>
				x.card.assignees.some((a) => a.userId === currentUserId),
			).length,
		};
	}, [board, currentUserId]);

	const totalCards = stats.total;
	const hasActiveFilters = Boolean(
		search || filterAssignee || filterClient || filterTag,
	);

	function openCreateCard(columnId?: string) {
		const fallback = board?.columns[0]?.id ?? null;
		setCardMode("create");
		setCreateColumnId(columnId ?? fallback);
		setSelectedCard(null);
		setCardDialogOpen(true);
	}

	function openEditCard(card: KanbanCard) {
		setCardMode("edit");
		setCreateColumnId(null);
		setSelectedCard(card);
		setCardDialogOpen(true);
	}

	async function handleDropCard(targetColumnId: string) {
		if (!draggingCardId || !allowEdit || !board) return;
		const cardId = draggingCardId;
		setDraggingCardId(null);
		setDropTargetColumnId(null);

		const targetColumn = board.columns.find((c) => c.id === targetColumnId);
		const position = targetColumn?.cards.length ?? 0;

		try {
			await kanbanApi.moveCard(cardId, {
				columnId: targetColumnId,
				position,
			});
			await loadBoard();
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao mover card",
				type: "error",
			});
		}
	}

	async function handleCreateColumn() {
		if (!newColumnName.trim()) return;
		try {
			await kanbanApi.createColumn(newColumnName.trim());
			toaster.create({ title: "Coluna criada", type: "success" });
			setNewColumnOpen(false);
			setNewColumnName("");
			await loadBoard();
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao criar coluna",
				type: "error",
			});
		}
	}

	async function handleDeleteColumn() {
		if (!deleteColumnId) return;
		try {
			await kanbanApi.removeColumn(deleteColumnId);
			toaster.create({ title: "Coluna excluída", type: "success" });
			setDeleteColumnId(null);
			await loadBoard();
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao excluir coluna",
				type: "error",
			});
		}
	}

	async function refreshAll() {
		await Promise.all([loadBoard(), loadFiltersData()]);
	}

	return (
		<Stack gap={5}>
			<Stack gap={1}>
				<Text
					fontSize="xs"
					fontWeight="600"
					color="helios.fg"
					textTransform="uppercase"
					letterSpacing="0.08em"
				>
					Operações
				</Text>
				<Heading size="lg">Kanban</Heading>
				<Text color="fg.muted" fontSize="sm">
					Organize tarefas com previsão, tags e responsáveis.
				</Text>
			</Stack>

			<KanbanToolbar
				allowEdit={allowEdit}
				showAssigneeFilter={actorPerfil === "admin_empresa"}
				q={q}
				onQChange={setQ}
				assigneeId={filterAssignee}
				onAssigneeChange={setFilterAssignee}
				clientId={filterClient}
				onClientChange={setFilterClient}
				tagId={filterTag}
				onTagChange={setFilterTag}
				sort={sort}
				onSortChange={setSort}
				users={users}
				clients={clients}
				tags={tags}
				onNewTask={() => openCreateCard()}
				onNewColumn={() => setNewColumnOpen(true)}
			/>

			{loading && !board ? (
				<KanbanSkeleton />
			) : error && !board ? (
				<KanbanErrorState message={error} onRetry={() => void loadBoard()} />
			) : (
				<>
					<KanbanStatistics stats={stats} />

					{totalCards === 0 && !hasActiveFilters ? (
						<KanbanEmptyState
							allowEdit={allowEdit}
							onCreate={() => openCreateCard()}
						/>
					) : (
						<KanbanBoard
							columns={board?.columns ?? []}
							allowEdit={allowEdit}
							draggingCardId={draggingCardId}
							dropTargetColumnId={dropTargetColumnId}
							onOpenCard={openEditCard}
							onCreateCard={openCreateCard}
							onDeleteColumn={(id) => setDeleteColumnId(id)}
							onDragStart={setDraggingCardId}
							onDragOverColumn={setDropTargetColumnId}
							onDropCard={(columnId) => void handleDropCard(columnId)}
						/>
					)}
				</>
			)}

			<KanbanCardDialog
				open={cardDialogOpen}
				onOpenChange={setCardDialogOpen}
				mode={cardMode}
				columnId={createColumnId}
				card={selectedCard}
				allowEdit={allowEdit}
				clients={clients}
				users={users}
				onSaved={refreshAll}
			/>

			<Dialog.Root
				open={newColumnOpen}
				onOpenChange={(e) => setNewColumnOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content borderRadius="2xl">
						<Dialog.Header>
							<Dialog.Title>Nova coluna</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Field.Root>
								<Field.Label>Nome</Field.Label>
								<Input
									value={newColumnName}
									onChange={(e) => setNewColumnName(e.target.value)}
									placeholder="Ex.: Aguardando cliente"
								/>
							</Field.Root>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button
								colorPalette="helios"
								onClick={() => void handleCreateColumn()}
							>
								Criar
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			<Dialog.Root
				open={Boolean(deleteColumnId)}
				onOpenChange={(e) => {
					if (!e.open) setDeleteColumnId(null);
				}}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content borderRadius="2xl">
						<Dialog.Header>
							<Dialog.Title>Excluir coluna?</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								A coluna será desativada. Mova os cards antes se necessário.
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button
								colorPalette="red"
								onClick={() => void handleDeleteColumn()}
							>
								Excluir
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Stack>
	);
}

export default function DashboardKanban() {
	return (
		<ModuleGate moduleKey="kanban">
			<KanbanPageContent />
		</ModuleGate>
	);
}
