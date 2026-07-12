import {
	Button,
	Field,
	HStack,
	Input,
	NativeSelect,
	Wrap,
} from "@chakra-ui/react";
import { memo } from "react";
import { LuPlus, LuSearch } from "react-icons/lu";

import type { KanbanSort, KanbanTag } from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };
type FilterClient = { id: string; name: string };

type KanbanToolbarProps = {
	allowEdit: boolean;
	showAssigneeFilter: boolean;
	q: string;
	onQChange: (value: string) => void;
	assigneeId: string;
	onAssigneeChange: (value: string) => void;
	clientId: string;
	onClientChange: (value: string) => void;
	tagId: string;
	onTagChange: (value: string) => void;
	sort: KanbanSort;
	onSortChange: (value: KanbanSort) => void;
	users: FilterUser[];
	clients: FilterClient[];
	tags: KanbanTag[];
	onNewTask: () => void;
	onNewColumn: () => void;
};

export const KanbanToolbar = memo(function KanbanToolbar({
	allowEdit,
	showAssigneeFilter,
	q,
	onQChange,
	assigneeId,
	onAssigneeChange,
	clientId,
	onClientChange,
	tagId,
	onTagChange,
	sort,
	onSortChange,
	users,
	clients,
	tags,
	onNewTask,
	onNewColumn,
}: KanbanToolbarProps) {
	return (
		<Wrap
			gap={3}
			align="end"
			justify="space-between"
			p={3}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
			position="sticky"
			top={0}
			zIndex={2}
		>
			<HStack gap={3} flexWrap="wrap" align="end" flex="1">
				<Field.Root maxW="240px" flex="1" minW="180px">
					<Field.Label>Pesquisar</Field.Label>
					<HStack
						borderWidth="1px"
						borderColor="border"
						borderRadius="lg"
						px={2}
						bg="bg"
					>
						<LuSearch size={14} />
						<Input
							border="none"
							ps={1}
							value={q}
							onChange={(e) => onQChange(e.target.value)}
							placeholder="Título, tag, cliente..."
						/>
					</HStack>
				</Field.Root>

				{showAssigneeFilter ? (
					<Field.Root maxW="180px">
						<Field.Label>Responsável</Field.Label>
						<NativeSelect.Root>
							<NativeSelect.Field
								value={assigneeId}
								onChange={(e) => onAssigneeChange(e.target.value)}
							>
								<option value="">Todos</option>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{u.name}
									</option>
								))}
							</NativeSelect.Field>
						</NativeSelect.Root>
					</Field.Root>
				) : null}

				<Field.Root maxW="180px">
					<Field.Label>Cliente</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={clientId}
							onChange={(e) => onClientChange(e.target.value)}
						>
							<option value="">Todos</option>
							{clients.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Field.Root>

				<Field.Root maxW="160px">
					<Field.Label>Tag</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={tagId}
							onChange={(e) => onTagChange(e.target.value)}
						>
							<option value="">Todas</option>
							{tags.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Field.Root>

				<Field.Root maxW="160px">
					<Field.Label>Ordenar</Field.Label>
					<NativeSelect.Root>
						<NativeSelect.Field
							value={sort}
							onChange={(e) => onSortChange(e.target.value as KanbanSort)}
						>
							<option value="position">Posição</option>
							<option value="dueAt">Previsão</option>
							<option value="createdAt">Criação</option>
							<option value="title">Título</option>
						</NativeSelect.Field>
					</NativeSelect.Root>
				</Field.Root>
			</HStack>

			{allowEdit ? (
				<HStack gap={2}>
					<Button variant="outline" size="sm" onClick={onNewColumn}>
						Nova coluna
					</Button>
					<Button colorPalette="helios" size="sm" onClick={onNewTask}>
						<LuPlus /> Nova tarefa
					</Button>
				</HStack>
			) : null}
		</Wrap>
	);
});
