import { Button, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";

type KanbanErrorStateProps = {
	message?: string;
	onRetry: () => void;
};

export function KanbanErrorState({
	message = "Não foi possível carregar o Kanban.",
	onRetry,
}: KanbanErrorStateProps) {
	return (
		<VStack
			py={14}
			px={6}
			borderWidth="1px"
			borderColor="red.muted"
			borderRadius="2xl"
			bg="red.subtle"
			gap={3}
			textAlign="center"
		>
			<Stack gap={1}>
				<Heading size="md">Algo deu errado</Heading>
				<Text color="fg.muted" fontSize="sm">
					{message}
				</Text>
			</Stack>
			<Button colorPalette="helios" onClick={onRetry}>
				<LuRefreshCw /> Tentar novamente
			</Button>
		</VStack>
	);
}
