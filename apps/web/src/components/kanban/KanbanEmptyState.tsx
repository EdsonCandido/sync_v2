import { Button, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import { LuKanban, LuPlus } from "react-icons/lu";

type KanbanEmptyStateProps = {
	allowEdit: boolean;
	onCreate: () => void;
};

export function KanbanEmptyState({
	allowEdit,
	onCreate,
}: KanbanEmptyStateProps) {
	return (
		<VStack
			py={16}
			px={6}
			borderWidth="1px"
			borderStyle="dashed"
			borderColor="border"
			borderRadius="2xl"
			bg="bg.muted"
			gap={4}
			textAlign="center"
		>
			<LuKanban size={40} />
			<Stack gap={1}>
				<Heading size="md">Nenhuma tarefa ainda</Heading>
				<Text color="fg.muted" fontSize="sm" maxW="360px">
					Organize o trabalho em colunas. Crie a primeira tarefa para começar.
				</Text>
			</Stack>
			{allowEdit ? (
				<Button colorPalette="helios" onClick={onCreate}>
					<LuPlus /> Nova tarefa
				</Button>
			) : null}
		</VStack>
	);
}
