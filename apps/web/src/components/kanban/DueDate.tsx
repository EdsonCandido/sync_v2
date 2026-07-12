import { Badge, HStack, Text } from "@chakra-ui/react";
import { memo } from "react";
import { LuCalendar } from "react-icons/lu";

type DueDateProps = {
	dueAt: string | null | undefined;
	overdue?: boolean;
};

export const DueDate = memo(function DueDate({ dueAt, overdue }: DueDateProps) {
	if (!dueAt) return null;
	const label = new Date(dueAt).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "short",
	});

	return (
		<Badge
			colorPalette={overdue ? "red" : "gray"}
			variant="subtle"
			rounded="md"
			px={1.5}
		>
			<HStack gap={1}>
				<LuCalendar size={12} />
				<Text fontSize="2xs" fontWeight="600">
					{label}
				</Text>
			</HStack>
		</Badge>
	);
});
