import {
	Box,
	Button,
	Checkbox,
	CheckboxGroup,
	Fieldset,
	HStack,
	IconButton,
	Input,
	Stack,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import { LuDownload, LuTrash2 } from "react-icons/lu";

import type {
	KanbanAttachment,
	KanbanChecklistItem,
	KanbanHistoryItem,
} from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };

type KanbanCardDialogHistoryColumnProps = {
	mode: "create" | "edit";
	readOnly: boolean;
	users: FilterUser[];
	assigneeIds: string[];
	onAssigneeIdsChange: (ids: string[]) => void;
	createdAt?: string;
	history: KanbanHistoryItem[];
	observation: string;
	onObservationChange: (value: string) => void;
	onAddObservation: () => void;
	checklist: KanbanChecklistItem[];
	checklistTitle: string;
	onChecklistTitleChange: (value: string) => void;
	onAddChecklist: () => void;
	onToggleChecklist: (itemId: string, done: boolean) => void;
	onRemoveChecklist: (itemId: string) => void;
	attachments: KanbanAttachment[];
	uploading: boolean;
	onUploadAttachments: (files: FileList | null) => void;
	onDownloadAttachment: (id: string, name: string) => void;
	onRemoveAttachment: (id: string) => void;
};

function formatFileSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KanbanCardDialogHistoryColumn({
	mode,
	readOnly,
	users,
	assigneeIds,
	onAssigneeIdsChange,
	createdAt,
	history,
	observation,
	onObservationChange,
	onAddObservation,
	checklist,
	checklistTitle,
	onChecklistTitleChange,
	onAddChecklist,
	onToggleChecklist,
	onRemoveChecklist,
	attachments,
	uploading,
	onUploadAttachments,
	onDownloadAttachment,
	onRemoveAttachment,
}: KanbanCardDialogHistoryColumnProps) {
	return (
		<Stack
			gap={4}
			h="full"
			borderWidth="1px"
			borderColor="border"
			borderRadius="xl"
			p={4}
			minH={0}
		>
			<Text fontWeight="700" fontSize="sm">
				Responsáveis e histórico
			</Text>

			<Fieldset.Root disabled={readOnly}>
				<Fieldset.Legend>
					Responsáveis atuais{" "}
					<Text as="span" color="fg.error">
						*
					</Text>
				</Fieldset.Legend>
				<Box
					borderWidth="1px"
					borderColor="border"
					borderRadius="lg"
					p={3}
					maxH="140px"
					overflowY="auto"
					bg="bg.subtle"
				>
					<CheckboxGroup
						value={assigneeIds}
						onValueChange={onAssigneeIdsChange}
						disabled={readOnly}
					>
						<VStack align="stretch" gap={2}>
							{users.map((u) => (
								<Checkbox.Root key={u.id} value={u.id}>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
									<Checkbox.Label>
										{u.name} ({u.email})
									</Checkbox.Label>
								</Checkbox.Root>
							))}
						</VStack>
					</CheckboxGroup>
				</Box>
			</Fieldset.Root>

			{mode === "edit" ? (
				<>
					{createdAt ? (
						<Text fontSize="xs" color="fg.muted">
							Criado em {new Date(createdAt).toLocaleString("pt-BR")}
						</Text>
					) : null}

					<Stack gap={2}>
						<Text fontWeight="600" fontSize="sm">
							Checklist
						</Text>
						{checklist.map((item) => (
							<HStack key={item.id} gap={2}>
								<Checkbox.Root
									checked={item.done}
									disabled={readOnly}
									onCheckedChange={(e) => {
										onToggleChecklist(item.id, e.checked === true);
									}}
									flex="1"
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
									<Checkbox.Label
										textDecoration={item.done ? "line-through" : undefined}
									>
										{item.title}
									</Checkbox.Label>
								</Checkbox.Root>
								{!readOnly ? (
									<IconButton
										aria-label="Remover item"
										size="xs"
										variant="ghost"
										colorPalette="red"
										onClick={() => onRemoveChecklist(item.id)}
									>
										<LuTrash2 />
									</IconButton>
								) : null}
							</HStack>
						))}
						{!readOnly ? (
							<HStack gap={2}>
								<Input
									value={checklistTitle}
									onChange={(e) => onChecklistTitleChange(e.target.value)}
									placeholder="Novo item"
									size="sm"
								/>
								<Button size="sm" onClick={onAddChecklist}>
									Adicionar
								</Button>
							</HStack>
						) : null}
					</Stack>

					<Stack gap={2}>
						<Text fontWeight="600" fontSize="sm">
							Anexos
						</Text>
						{attachments.length === 0 ? (
							<Text fontSize="sm" color="fg.muted">
								Nenhum anexo.
							</Text>
						) : (
							attachments.map((file) => (
								<HStack key={file.id} gap={2} justify="space-between">
									<Box minW={0} flex="1">
										<Text fontSize="sm" truncate>
											{file.originalName}
										</Text>
										<Text fontSize="xs" color="fg.muted">
											{formatFileSize(file.sizeBytes)}
										</Text>
									</Box>
									<HStack gap={1}>
										<IconButton
											aria-label="Baixar anexo"
											size="xs"
											variant="ghost"
											onClick={() =>
												onDownloadAttachment(file.id, file.originalName)
											}
										>
											<LuDownload />
										</IconButton>
										{!readOnly ? (
											<IconButton
												aria-label="Remover anexo"
												size="xs"
												variant="ghost"
												colorPalette="red"
												onClick={() => onRemoveAttachment(file.id)}
											>
												<LuTrash2 />
											</IconButton>
										) : null}
									</HStack>
								</HStack>
							))
						)}
						{!readOnly ? (
							<Box>
								<Input
									type="file"
									multiple
									disabled={uploading}
									onChange={(e) => {
										onUploadAttachments(e.target.files);
										e.target.value = "";
									}}
									size="sm"
								/>
								{uploading ? (
									<Text fontSize="xs" color="fg.muted" mt={1}>
										Enviando...
									</Text>
								) : null}
							</Box>
						) : null}
					</Stack>

					<Stack gap={2} flex="1" minH={0}>
						<Text fontWeight="600" fontSize="sm">
							Histórico
						</Text>
						{!readOnly ? (
							<HStack gap={2} align="start">
								<Textarea
									value={observation}
									onChange={(e) => onObservationChange(e.target.value)}
									placeholder="Nova observação"
									rows={2}
									flex="1"
								/>
								<Button onClick={onAddObservation} alignSelf="stretch">
									Registrar
								</Button>
							</HStack>
						) : null}
						<VStack
							align="stretch"
							gap={2}
							maxH="240px"
							overflowY="auto"
							borderWidth="1px"
							borderColor="border"
							borderRadius="lg"
							p={3}
							bg="bg.subtle"
						>
							{history.length === 0 ? (
								<Text fontSize="sm" color="fg.muted">
									Sem histórico ainda.
								</Text>
							) : (
								history.map((h) => (
									<Box key={h.id}>
										<Text fontSize="xs" color="fg.muted">
											{new Date(h.createdAt).toLocaleString("pt-BR")}
											{h.userName ? ` — ${h.userName}` : ""}
											{` · ${h.eventType}`}
										</Text>
										<Text fontSize="sm">{h.message}</Text>
									</Box>
								))
							)}
						</VStack>
					</Stack>
				</>
			) : (
				<Text fontSize="sm" color="fg.muted">
					Histórico, checklist e anexos ficam disponíveis após criar a tarefa.
				</Text>
			)}
		</Stack>
	);
}
