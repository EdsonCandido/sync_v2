import {
	Button,
	ButtonGroup,
	HStack,
	IconButton,
	Text,
	Wrap,
} from "@chakra-ui/react";
import { memo } from "react";
import { LuPencil, LuPlus, LuStar, LuTrash2 } from "react-icons/lu";

import type { KanbanBoardSummary, KanbanViewMode } from "@/lib/kanban-api";

type KanbanBoardSwitcherProps = {
	boards: KanbanBoardSummary[];
	activeBoardId: string | null;
	viewMode: KanbanViewMode;
	featuredBoardId: string | null;
	canCreate: boolean;
	canDeleteBoards: boolean;
	onSelectBoard: (boardId: string) => void;
	onViewModeChange: (mode: KanbanViewMode) => void;
	onFeaturedChange: (boardId: string) => void;
	onCreate: () => void;
	onEdit: (board: KanbanBoardSummary) => void;
	onDelete: (board: KanbanBoardSummary) => void;
};

export const KanbanBoardSwitcher = memo(function KanbanBoardSwitcher({
	boards,
	activeBoardId,
	viewMode,
	featuredBoardId,
	canCreate,
	canDeleteBoards,
	onSelectBoard,
	onViewModeChange,
	onFeaturedChange,
	onCreate,
	onEdit,
	onDelete,
}: KanbanBoardSwitcherProps) {
	const visibleBoards =
		viewMode === "featured" && featuredBoardId
			? boards.filter((b) => b.id === featuredBoardId)
			: boards;

	return (
		<Wrap
			gap={3}
			align="center"
			justify="space-between"
			p={3}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
		>
			<HStack gap={2} flexWrap="wrap" flex="1">
				<Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">
					Kanbans
				</Text>
				{visibleBoards.map((board) => {
					const isActive = board.id === activeBoardId;
					return (
						<HStack key={board.id} gap={1}>
							<Button
								size="sm"
								variant={isActive ? "solid" : "outline"}
								colorPalette="helios"
								onClick={() => onSelectBoard(board.id)}
							>
								{board.name}
								{board.isDefault ? " · default" : ""}
							</Button>
							{viewMode === "all" ? (
								<IconButton
									aria-label="Definir destaque"
									size="xs"
									variant="ghost"
									colorPalette={
										featuredBoardId === board.id ? "helios" : "gray"
									}
									onClick={() => onFeaturedChange(board.id)}
								>
									<LuStar
										fill={
											featuredBoardId === board.id ? "currentColor" : "none"
										}
									/>
								</IconButton>
							) : null}
							{board.canManage ? (
								<>
									<IconButton
										aria-label="Editar kanban"
										size="xs"
										variant="ghost"
										onClick={() => onEdit(board)}
									>
										<LuPencil />
									</IconButton>
									{!board.isDefault && canDeleteBoards ? (
										<IconButton
											aria-label="Excluir kanban"
											size="xs"
											variant="ghost"
											colorPalette="red"
											onClick={() => onDelete(board)}
										>
											<LuTrash2 />
										</IconButton>
									) : null}
								</>
							) : null}
						</HStack>
					);
				})}
			</HStack>

			<HStack gap={2} flexWrap="wrap">
				<ButtonGroup size="sm" attached variant="outline">
					<Button
						variant={viewMode === "all" ? "solid" : "outline"}
						colorPalette="helios"
						onClick={() => onViewModeChange("all")}
					>
						Todos
					</Button>
					<Button
						variant={viewMode === "featured" ? "solid" : "outline"}
						colorPalette="helios"
						onClick={() => onViewModeChange("featured")}
						disabled={!featuredBoardId}
					>
						Destaque
					</Button>
				</ButtonGroup>
				{canCreate ? (
					<Button size="sm" colorPalette="helios" onClick={onCreate}>
						<LuPlus />
						Novo kanban
					</Button>
				) : null}
			</HStack>
		</Wrap>
	);
});
