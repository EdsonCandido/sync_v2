import { Badge } from "@chakra-ui/react";
import { memo } from "react";

import type { KanbanTag } from "@/lib/kanban-api";

type TagBadgeProps = {
	tag: Pick<KanbanTag, "name" | "color">;
	size?: "sm" | "md";
};

export const TagBadge = memo(function TagBadge({
	tag,
	size = "sm",
}: TagBadgeProps) {
	return (
		<Badge colorPalette={tag.color} size={size} variant="subtle" rounded="full">
			{tag.name}
		</Badge>
	);
});
