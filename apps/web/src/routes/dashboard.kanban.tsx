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
import { KanbanBoardDialog } from "@/components/kanban/KanbanBoardDialog";
import { KanbanBoardSwitcher } from "@/components/kanban/KanbanBoardSwitcher";
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
	type KanbanBoardSummary,
	type KanbanCard,
	type KanbanSort,
	type KanbanTag,
	type KanbanViewMode,
	kanbanApi,
	loadKanbanPrefs,
	saveKanbanPrefs,
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
	const companyId =
		(session?.user as { companyId?: string | null } | undefined)?.companyId ??
		"";

	const [boards, setBoards] = useState<KanbanBoardSummary[]>([]);
	const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<KanbanViewMode>("all");
	const [featuredBoardId, setFeaturedBoardId] = useState<string | null>(null);
	const [prefsReady, setPrefsReady] = useState(false);

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

	const [boardDialogOpen, setBoardDialogOpen] = useState(false);
	const [boardDialogMode, setBoardDialogMode] = useState<"create" | "edit">(
		"create",
	);
	const [editingBoard, setEditingBoard] = useState<KanbanBoardSummary | null>(
		null,
	);
	const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);

	const canCreateBoard = actorPerfil === "admin_empresa" && allowEdit;

	useEffect(() => {
		if (!companyId || !currentUserId) return;
		const prefs = loadKanbanPrefs(companyId, currentUserId);
		setViewMode(prefs.viewMode);
		setFeaturedBoardId(prefs.featuredBoardId);
		setPrefsReady(true);
	}, [companyId, currentUserId]);

	useEffect(() => {
		if (!prefsReady || !companyId || !currentUserId) return;
		saveKanbanPrefs(companyId, currentUserId, {
			viewMode,
			featuredBoardId,
		});
	}, [prefsReady, companyId, currentUserId, viewMode, featuredBoardId]);

	const loadBoards = useCallback(async () => {
		const result = await kanbanApi.listBoards();
		setBoards(result.boards);
		return result.boards;
	}, []);

	const loadBoard = useCallback(async () => {
		if (!activeBoardId) return;
		setLoading(true);
		setError(null);
		try {
			const result = await kanbanApi.getBoard({
				boardId: activeBoardId,
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
	}, [activeBoardId, search, filterAssignee, filterClient, filterTag, sort]);

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
		if (!prefsReady) return;
		void (async () => {
			try {
				const list = await loadBoards();
				if (list.length === 0) return;
				setFeaturedBoardId((current) => {
					if (current && list.some((b) => b.id === current)) return current;
					return list[0]?.id ?? null;
				});
				setActiveBoardId((current) => {
					if (current && list.some((b) => b.id === current)) return current;
					return list[0]?.id ?? null;
				});
			} catch (err) {
				const message =
					err instanceof ApiError ? err.message : "Erro ao listar kanbans";
				setError(message);
				setLoading(false);
			}
		})();
	}, [prefsReady, loadBoards]);

	useEffect(() => {
		if (!prefsReady || viewMode !== "featured" || !featuredBoardId) return;
		setActiveBoardId(featuredBoardId);
	}, [prefsReady, viewMode, featuredBoardId]);

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
		if (!newColumnName.trim() || !activeBoardId) return;
		try {
			await kanbanApi.createColumn(activeBoardId, newColumnName.trim());
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

	async function handleDeleteBoard() {
		if (!deleteBoardId) return;
		try {
			await kanbanApi.removeBoard(deleteBoardId);
			toaster.create({ title: "Kanban excluído", type: "success" });
			if (activeBoardId === deleteBoardId) {
				setActiveBoardId(null);
				setBoard(null);
			}
			if (featuredBoardId === deleteBoardId) {
				setFeaturedBoardId(null);
			}
			setDeleteBoardId(null);
			const list = await loadBoards();
			setActiveBoardId(list[0]?.id ?? null);
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao excluir kanban",
				type: "error",
			});
		}
	}

	async function refreshAll() {
		await Promise.all([loadBoards(), loadBoard(), loadFiltersData()]);
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

			<KanbanBoardSwitcher
				boards={boards}
				activeBoardId={activeBoardId}
				viewMode={viewMode}
				featuredBoardId={featuredBoardId}
				canCreate={canCreateBoard}
				canDeleteBoards={canCreateBoard}
				onSelectBoard={setActiveBoardId}
				onViewModeChange={setViewMode}
				onFeaturedChange={setFeaturedBoardId}
				onCreate={() => {
					setBoardDialogMode("create");
					setEditingBoard(null);
					setBoardDialogOpen(true);
				}}
				onEdit={(b) => {
					setBoardDialogMode("edit");
					setEditingBoard(b);
					setBoardDialogOpen(true);
				}}
				onDelete={(b) => setDeleteBoardId(b.id)}
			/>

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

			<KanbanBoardDialog
				open={boardDialogOpen}
				onOpenChange={setBoardDialogOpen}
				mode={boardDialogMode}
				board={editingBoard}
				users={users}
				onSaved={async (saved) => {
					await loadBoards();
					if (saved?.id) {
						setActiveBoardId(saved.id);
						return;
					}
					await loadBoard();
				}}
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

			<Dialog.Root
				open={Boolean(deleteBoardId)}
				onOpenChange={(e) => {
					if (!e.open) setDeleteBoardId(null);
				}}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content borderRadius="2xl">
						<Dialog.Header>
							<Dialog.Title>Excluir kanban?</Dialog.Title>
							<Dialog.CloseTrigger />
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								O kanban será desativado. Cards e colunas ficam ocultos com ele.
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancelar</Button>
							</Dialog.ActionTrigger>
							<Button
								colorPalette="red"
								onClick={() => void handleDeleteBoard()}
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
