import { HStack } from "@chakra-ui/react";
import { memo } from "react";

import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import type {
	KanbanCard,
	KanbanColumn as KanbanColumnData,
} from "@/lib/kanban-api";

type KanbanBoardProps = {
	columns: KanbanColumnData[];
	allowEdit: boolean;
	draggingCardId: string | null;
	dropTargetColumnId: string | null;
	onOpenCard: (card: KanbanCard) => void;
	onCreateCard: (columnId: string) => void;
	onDeleteColumn: (columnId: string) => void;
	onDragStart: (cardId: string) => void;
	onDragOverColumn: (columnId: string | null) => void;
	onDropCard: (columnId: string) => void;
};

export const KanbanBoard = memo(function KanbanBoard({
	columns,
	allowEdit,
	draggingCardId,
	dropTargetColumnId,
	onOpenCard,
	onCreateCard,
	onDeleteColumn,
	onDragStart,
	onDragOverColumn,
	onDropCard,
}: KanbanBoardProps) {
	return (
		<HStack
			align="start"
			gap={4}
			overflowX="auto"
			pb={4}
			px={1}
			scrollSnapType={{ base: "x mandatory", md: "none" }}
			css={{
				scrollbarWidth: "thin",
			}}
		>
			{columns.map((column) => (
				<KanbanColumn
					key={column.id}
					column={column}
					allowEdit={allowEdit}
					draggingCardId={draggingCardId}
					dropTarget={dropTargetColumnId === column.id}
					onOpenCard={onOpenCard}
					onCreateCard={onCreateCard}
					onDeleteColumn={onDeleteColumn}
					onDragStart={onDragStart}
					onDragOverColumn={onDragOverColumn}
					onDropCard={onDropCard}
				/>
			))}
		</HStack>
	);
});
