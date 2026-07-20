import { Box, Button, Stack, Text, Wrap } from "@chakra-ui/react";

import { getColumnAccent } from "@/components/kanban/columnAccent";

export type PhaseColumnOption = {
	id: string;
	name: string;
	slug: string;
	cardCount: number;
};

type KanbanCardDialogPhaseColumnProps = {
	columns: PhaseColumnOption[];
	currentColumnId: string | null;
	disabled: boolean;
	moving: boolean;
	onSelectPhase: (columnId: string) => void;
};

export function KanbanCardDialogPhaseColumn({
	columns,
	currentColumnId,
	disabled,
	moving,
	onSelectPhase,
}: KanbanCardDialogPhaseColumnProps) {
	return (
		<Stack
			gap={4}
			h="full"
			borderWidth="1px"
			borderColor="border"
			borderRadius="xl"
			p={4}
			bg="bg.subtle"
		>
			<Box>
				<Text fontWeight="700" fontSize="sm">
					Fases do kanban
				</Text>
				<Text fontSize="xs" color="fg.muted" mt={1}>
					Selecione a fase para mover o card.
				</Text>
			</Box>

			{disabled ? (
				<Text fontSize="sm" color="fg.muted">
					Disponível após criar a tarefa.
				</Text>
			) : columns.length === 0 ? (
				<Text fontSize="sm" color="fg.muted">
					Nenhuma coluna disponível.
				</Text>
			) : (
				<Wrap gap={2}>
					{columns.map((col) => {
						const accent = getColumnAccent(col.slug);
						const selected = col.id === currentColumnId;
						return (
							<Button
								key={col.id}
								size="sm"
								variant={selected ? "solid" : "outline"}
								colorPalette={accent.badge}
								borderLeftWidth="4px"
								borderLeftColor={accent.bar}
								disabled={moving || selected}
								onClick={() => onSelectPhase(col.id)}
								aria-pressed={selected}
								aria-current={selected ? "true" : undefined}
							>
								{col.name}
							</Button>
						);
					})}
				</Wrap>
			)}
		</Stack>
	);
}
