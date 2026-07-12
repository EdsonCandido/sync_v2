import {
	Badge,
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Text,
	VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { memo } from "react";
import {
	LuBan,
	LuCircleCheck,
	LuCircleDashed,
	LuLoader,
	LuPlus,
	LuTrash2,
} from "react-icons/lu";

import { getColumnAccent } from "@/components/kanban/columnAccent";
import { KanbanCardItem } from "@/components/kanban/KanbanCardItem";
import type {
	KanbanCard,
	KanbanColumn as KanbanColumnData,
} from "@/lib/kanban-api";

const MotionBox = motion.create(Box);

function ColumnIcon({ slug }: { slug: string }) {
	if (slug === "em_execucao") return <LuLoader size={16} />;
	if (slug === "concluido") return <LuCircleCheck size={16} />;
	if (slug === "cancelado") return <LuBan size={16} />;
	return <LuCircleDashed size={16} />;
}

type KanbanColumnProps = {
	column: KanbanColumnData;
	allowEdit: boolean;
	draggingCardId: string | null;
	dropTarget: boolean;
	onOpenCard: (card: KanbanCard) => void;
	onCreateCard: (columnId: string) => void;
	onDeleteColumn: (columnId: string) => void;
	onDragStart: (cardId: string) => void;
	onDragOverColumn: (columnId: string | null) => void;
	onDropCard: (columnId: string) => void;
};

export const KanbanColumn = memo(function KanbanColumn({
	column,
	allowEdit,
	draggingCardId,
	dropTarget,
	onOpenCard,
	onCreateCard,
	onDeleteColumn,
	onDragStart,
	onDragOverColumn,
	onDropCard,
}: KanbanColumnProps) {
	const accent = getColumnAccent(column.slug);

	return (
		<MotionBox
			minW={{ base: "85vw", sm: "300px", md: "320px" }}
			maxW={{ base: "85vw", sm: "300px", md: "320px" }}
			flexShrink={0}
			scrollSnapAlign="start"
			bg={accent.bg}
			borderRadius="2xl"
			overflow="hidden"
			borderWidth="1px"
			borderColor={dropTarget ? accent.bar : "transparent"}
			animate={{
				scale: dropTarget ? 1.01 : 1,
				boxShadow: dropTarget
					? "0 0 0 2px var(--chakra-colors-helios-solid)"
					: "none",
			}}
			transition={{ duration: 0.2 }}
			onDragOver={(e) => {
				if (!allowEdit) return;
				e.preventDefault();
				e.dataTransfer.dropEffect = "move";
				onDragOverColumn(column.id);
			}}
			onDragLeave={() => onDragOverColumn(null)}
			onDrop={(e) => {
				if (!allowEdit) return;
				e.preventDefault();
				onDragOverColumn(null);
				onDropCard(column.id);
			}}
			display="flex"
			flexDirection="column"
			maxH={{ base: "70vh", md: "calc(100vh - 280px)" }}
		>
			<Box h="3px" bg={accent.bar} />
			<HStack
				justify="space-between"
				px={3}
				py={3}
				position="sticky"
				top={0}
				zIndex={1}
				bg={accent.bg}
				gap={2}
			>
				<HStack gap={2} flex="1" minW={0}>
					<Box color={accent.icon}>
						<ColumnIcon slug={column.slug} />
					</Box>
					<Heading size="sm" lineClamp={1}>
						{column.name}
					</Heading>
					<Badge colorPalette={accent.badge} variant="subtle" rounded="full">
						{column.cards.length}
					</Badge>
				</HStack>
				{allowEdit && !column.isBase ? (
					<IconButton
						aria-label="Excluir coluna"
						size="xs"
						variant="ghost"
						colorPalette="red"
						onClick={() => onDeleteColumn(column.id)}
					>
						<LuTrash2 />
					</IconButton>
				) : null}
			</HStack>

			<VStack
				align="stretch"
				gap={2.5}
				px={3}
				pb={3}
				flex="1"
				overflowY="auto"
				minH="140px"
			>
				{column.cards.length === 0 ? (
					<Box
						borderWidth="1px"
						borderStyle="dashed"
						borderColor="border"
						borderRadius="xl"
						p={4}
						textAlign="center"
					>
						<Text fontSize="sm" color="fg.muted">
							Nenhuma tarefa
						</Text>
						{allowEdit ? (
							<Button
								mt={2}
								size="xs"
								variant="ghost"
								onClick={() => onCreateCard(column.id)}
							>
								<LuPlus /> Criar
							</Button>
						) : null}
					</Box>
				) : (
					column.cards.map((card) => (
						<KanbanCardItem
							key={card.id}
							card={card}
							columnSlug={column.slug}
							draggable={allowEdit}
							isDragging={draggingCardId === card.id}
							onOpen={onOpenCard}
							onDragStart={onDragStart}
						/>
					))
				)}
			</VStack>

			{allowEdit ? (
				<Box px={3} pb={3}>
					<Button
						size="sm"
						variant="ghost"
						width="full"
						justifyContent="flex-start"
						onClick={() => onCreateCard(column.id)}
					>
						<LuPlus /> Nova tarefa
					</Button>
				</Box>
			) : null}
		</MotionBox>
	);
});
