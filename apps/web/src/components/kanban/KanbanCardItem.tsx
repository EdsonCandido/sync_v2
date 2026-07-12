import { Box, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { memo } from "react";

import { isCardOverdue } from "@/components/kanban/columnAccent";
import { KanbanCardFooter } from "@/components/kanban/KanbanCardFooter";
import { KanbanCardHeader } from "@/components/kanban/KanbanCardHeader";
import type { KanbanCard as KanbanCardType } from "@/lib/kanban-api";

const MotionBox = motion.create(Box);

type KanbanCardItemProps = {
	card: KanbanCardType;
	columnSlug: string;
	draggable: boolean;
	isDragging: boolean;
	onOpen: (card: KanbanCardType) => void;
	onDragStart: (cardId: string) => void;
};

export const KanbanCardItem = memo(function KanbanCardItem({
	card,
	columnSlug,
	draggable,
	isDragging,
	onOpen,
	onDragStart,
}: KanbanCardItemProps) {
	const overdue = isCardOverdue(card.dueAt, columnSlug);

	return (
		<MotionBox
			initial={false}
			animate={
				isDragging
					? {
							scale: 1.04,
							rotate: 1.5,
							boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
						}
					: { scale: 1, rotate: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" }
			}
			whileHover={
				draggable
					? {
							scale: 1.02,
							boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
						}
					: undefined
			}
			transition={{ duration: 0.2 }}
		>
			<Box
				bg="bg.panel"
				borderWidth="1px"
				borderColor={overdue ? "red.muted" : "border"}
				borderRadius="xl"
				p={3.5}
				cursor={draggable ? "grab" : "pointer"}
				draggable={draggable}
				onDragStart={(e) => {
					if (!draggable) return;
					e.dataTransfer.setData("text/plain", card.id);
					e.dataTransfer.effectAllowed = "move";
					onDragStart(card.id);
				}}
				onClick={() => onOpen(card)}
			>
				<VStack align="stretch" gap={3}>
					<KanbanCardHeader card={card} overdue={overdue} />
					<KanbanCardFooter card={card} overdue={overdue} />
				</VStack>
			</Box>
		</MotionBox>
	);
});
