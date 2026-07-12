import { Badge, Heading, Text, VStack, Wrap } from "@chakra-ui/react";
import { memo } from "react";

import { TagBadge } from "@/components/kanban/TagBadge";
import type { KanbanCard } from "@/lib/kanban-api";

type KanbanCardHeaderProps = {
	card: KanbanCard;
	overdue?: boolean;
};

export const KanbanCardHeader = memo(function KanbanCardHeader({
	card,
	overdue,
}: KanbanCardHeaderProps) {
	return (
		<VStack align="stretch" gap={2}>
			<Heading size="sm" fontWeight="700" lineClamp={2}>
				{card.title}
			</Heading>
			{card.description ? (
				<Text fontSize="xs" color="fg.muted" lineClamp={2}>
					{card.description}
				</Text>
			) : null}
			{(card.clientName || overdue || card.tags.length > 0) && (
				<Wrap gap={1.5}>
					{overdue ? (
						<Badge colorPalette="red" variant="solid" size="sm" rounded="full">
							Atrasada
						</Badge>
					) : null}
					{card.clientName ? (
						<Badge
							colorPalette="gray"
							variant="outline"
							size="sm"
							rounded="full"
						>
							{card.clientName}
						</Badge>
					) : null}
					{card.tags.map((tag) => (
						<TagBadge key={tag.id} tag={tag} />
					))}
				</Wrap>
			)}
		</VStack>
	);
});
