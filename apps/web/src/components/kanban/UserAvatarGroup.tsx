import { Avatar, HStack } from "@chakra-ui/react";
import { memo } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import type { KanbanAssignee } from "@/lib/kanban-api";

type UserAvatarGroupProps = {
	assignees: KanbanAssignee[];
	max?: number;
};

export const UserAvatarGroup = memo(function UserAvatarGroup({
	assignees,
	max = 3,
}: UserAvatarGroupProps) {
	const visible = assignees.slice(0, max);
	const rest = assignees.length - visible.length;

	return (
		<HStack gap={0}>
			{visible.map((a, index) => (
				<Tooltip key={a.userId} content={a.name} showArrow>
					<Avatar.Root
						size="xs"
						ms={index === 0 ? 0 : -2}
						borderWidth="2px"
						borderColor="bg.panel"
					>
						<Avatar.Fallback name={a.name} />
					</Avatar.Root>
				</Tooltip>
			))}
			{rest > 0 ? (
				<Avatar.Root size="xs" ms={-2} borderWidth="2px" borderColor="bg.panel">
					<Avatar.Fallback>+{rest}</Avatar.Fallback>
				</Avatar.Root>
			) : null}
		</HStack>
	);
});
