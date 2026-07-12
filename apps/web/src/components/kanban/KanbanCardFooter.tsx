import { HStack, Text } from "@chakra-ui/react";
import { memo } from "react";
import { LuMessageSquare } from "react-icons/lu";

import { DueDate } from "@/components/kanban/DueDate";
import { ProgressIndicator } from "@/components/kanban/ProgressIndicator";
import { UserAvatarGroup } from "@/components/kanban/UserAvatarGroup";
import type { KanbanCard } from "@/lib/kanban-api";

type KanbanCardFooterProps = {
	card: KanbanCard;
	overdue?: boolean;
};

export const KanbanCardFooter = memo(function KanbanCardFooter({
	card,
	overdue,
}: KanbanCardFooterProps) {
	return (
		<>
			<ProgressIndicator
				done={card.checklistDoneCount}
				total={card.checklistTotalCount}
			/>
			<HStack justify="space-between" gap={2} mt={1}>
				<UserAvatarGroup assignees={card.assignees} />
				<HStack gap={2}>
					{card.observationCount > 0 ? (
						<HStack gap={0.5} color="fg.muted">
							<LuMessageSquare size={12} />
							<Text fontSize="2xs">{card.observationCount}</Text>
						</HStack>
					) : null}
					<DueDate dueAt={card.dueAt} overdue={overdue} />
				</HStack>
			</HStack>
		</>
	);
});
