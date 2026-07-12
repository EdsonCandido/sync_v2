import {
	Box,
	Button,
	Checkbox,
	Dialog,
	Field,
	HStack,
	IconButton,
	Input,
	NativeSelect,
	Stack,
	Text,
	Textarea,
	VStack,
	Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";

import { TagBadge } from "@/components/kanban/TagBadge";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type CreateKanbanCardInput,
	type KanbanCard,
	type KanbanCardDetail,
	kanbanApi,
	type UpdateKanbanCardInput,
} from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };
type FilterClient = { id: string; name: string };

type KanbanCardDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	columnId: string | null;
	card: KanbanCard | null;
	allowEdit: boolean;
	clients: FilterClient[];
	users: FilterUser[];
	onSaved: () => Promise<void>;
};

function toDateInputValue(iso: string | null | undefined) {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

export function KanbanCardDialog({
	open,
	onOpenChange,
	mode,
	columnId,
	card,
	allowEdit,
	clients,
	users,
	onSaved,
}: KanbanCardDialogProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [clientId, setClientId] = useState("");
	const [dueAt, setDueAt] = useState("");
	const [tagNames, setTagNames] = useState<string[]>([]);
	const [tagDraft, setTagDraft] = useState("");
	const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
	const [detail, setDetail] = useState<KanbanCardDetail | null>(null);
	const [checklistTitle, setChecklistTitle] = useState("");
	const [observation, setObservation] = useState("");
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const readOnly = !allowEdit;

	useEffect(() => {
		if (!open) return;

		if (mode === "create") {
			setTitle("");
			setDescription("");
			setClientId("");
			setDueAt("");
			setTagNames([]);
			setTagDraft("");
			setAssigneeIds([]);
			setDetail(null);
			setChecklistTitle("");
			setObservation("");
			return;
		}

		if (!card) return;

		setTitle(card.title);
		setDescription(card.description ?? "");
		setClientId(card.clientId ?? "");
		setDueAt(toDateInputValue(card.dueAt));
		setTagNames(card.tags.map((t) => t.name));
		setAssigneeIds(card.assignees.map((a) => a.userId));
		setChecklistTitle("");
		setObservation("");
		setLoading(true);
		void kanbanApi
			.getCard(card.id)
			.then((d) => {
				setDetail(d);
				setTitle(d.title);
				setDescription(d.description ?? "");
				setClientId(d.clientId ?? "");
				setDueAt(toDateInputValue(d.dueAt));
				setTagNames(d.tags.map((t) => t.name));
				setAssigneeIds(d.assignees.map((a) => a.userId));
			})
			.catch((error) => {
				toaster.create({
					title:
						error instanceof ApiError ? error.message : "Erro ao carregar card",
					type: "error",
				});
			})
			.finally(() => setLoading(false));
	}, [open, mode, card]);

	function setAssignee(userId: string, checked: boolean) {
		setAssigneeIds((prev) => {
			if (checked) return prev.includes(userId) ? prev : [...prev, userId];
			return prev.filter((id) => id !== userId);
		});
	}

	function addTag() {
		const name = tagDraft.trim();
		if (!name) return;
		setTagNames((prev) =>
			prev.some((t) => t.toLowerCase() === name.toLowerCase())
				? prev
				: [...prev, name],
		);
		setTagDraft("");
	}

	async function handleSave() {
		if (readOnly) return;
		if (!title.trim()) {
			toaster.create({ title: "Título obrigatório", type: "error" });
			return;
		}
		if (assigneeIds.length === 0) {
			toaster.create({
				title: "Selecione ao menos um responsável",
				type: "error",
			});
			return;
		}

		const dueValue = dueAt ? new Date(`${dueAt}T12:00:00`).toISOString() : null;

		setSaving(true);
		try {
			if (mode === "create") {
				if (!columnId) return;
				const body: CreateKanbanCardInput = {
					columnId,
					title: title.trim(),
					description: description.trim() || null,
					clientId: clientId || null,
					dueAt: dueValue,
					tagNames,
					assigneeUserIds: assigneeIds,
				};
				await kanbanApi.createCard(body);
				toaster.create({ title: "Tarefa criada", type: "success" });
			} else if (card) {
				const body: UpdateKanbanCardInput = {
					title: title.trim(),
					description: description.trim() || null,
					clientId: clientId || null,
					dueAt: dueValue,
					tagNames,
					assigneeUserIds: assigneeIds,
				};
				await kanbanApi.updateCard(card.id, body);
				toaster.create({ title: "Tarefa atualizada", type: "success" });
			}
			onOpenChange(false);
			await onSaved();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	async function handleAddChecklist() {
		if (!card || !checklistTitle.trim() || readOnly) return;
		try {
			await kanbanApi.addChecklistItem(card.id, checklistTitle.trim());
			setChecklistTitle("");
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao adicionar item",
				type: "error",
			});
		}
	}

	async function handleToggleChecklist(itemId: string, done: boolean) {
		if (!card || readOnly) return;
		try {
			await kanbanApi.updateChecklistItem(card.id, itemId, { done });
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao atualizar item",
				type: "error",
			});
		}
	}

	async function handleRemoveChecklist(itemId: string) {
		if (!card || readOnly) return;
		try {
			await kanbanApi.removeChecklistItem(card.id, itemId);
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao remover item",
				type: "error",
			});
		}
	}

	async function handleAddObservation() {
		if (!card || !observation.trim() || readOnly) return;
		try {
			await kanbanApi.addObservation(card.id, observation.trim());
			setObservation("");
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			toaster.create({ title: "Observação registrada", type: "success" });
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao registrar observação",
				type: "error",
			});
		}
	}

	async function handleDeleteCard() {
		if (!card || readOnly) return;
		try {
			await kanbanApi.removeCard(card.id);
			toaster.create({ title: "Tarefa excluída", type: "success" });
			onOpenChange(false);
			await onSaved();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao excluir",
				type: "error",
			});
		}
	}

	const history = detail?.history ?? [];
	const checklist = detail?.checklistItems ?? card?.checklistItems ?? [];

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
			size="xl"
			scrollBehavior="inside"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content borderRadius="2xl">
					<Dialog.Header>
						<Dialog.Title>
							{mode === "create" ? "Nova tarefa" : "Tarefa"}
						</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						{loading ? (
							<Text color="fg.muted">Carregando...</Text>
						) : (
							<Stack gap={5}>
								<Field.Root required>
									<Field.Label>Título</Field.Label>
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										disabled={readOnly}
										placeholder="Título da tarefa"
									/>
								</Field.Root>

								<Field.Root>
									<Field.Label>Descrição</Field.Label>
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										disabled={readOnly}
										rows={3}
									/>
								</Field.Root>

								<HStack gap={3} align="start" flexWrap="wrap">
									<Field.Root flex="1" minW="180px">
										<Field.Label>Cliente (opcional)</Field.Label>
										<NativeSelect.Root disabled={readOnly}>
											<NativeSelect.Field
												value={clientId}
												onChange={(e) => setClientId(e.target.value)}
											>
												<option value="">Nenhum</option>
												{clients.map((c) => (
													<option key={c.id} value={c.id}>
														{c.name}
													</option>
												))}
											</NativeSelect.Field>
										</NativeSelect.Root>
									</Field.Root>

									<Field.Root flex="1" minW="180px">
										<Field.Label>Previsão de conclusão</Field.Label>
										<Input
											type="date"
											value={dueAt}
											onChange={(e) => setDueAt(e.target.value)}
											disabled={readOnly}
										/>
									</Field.Root>
								</HStack>

								<Field.Root>
									<Field.Label>Tags</Field.Label>
									<Wrap gap={2} mb={2}>
										{tagNames.map((name) => (
											<HStack key={name} gap={1}>
												<TagBadge tag={{ name, color: "gray" }} />
												{allowEdit ? (
													<IconButton
														aria-label="Remover tag"
														size="2xs"
														variant="ghost"
														onClick={() =>
															setTagNames((prev) =>
																prev.filter((t) => t !== name),
															)
														}
													>
														<LuX />
													</IconButton>
												) : null}
											</HStack>
										))}
									</Wrap>
									{allowEdit ? (
										<HStack gap={2}>
											<Input
												value={tagDraft}
												onChange={(e) => setTagDraft(e.target.value)}
												placeholder="Nova tag"
												size="sm"
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														addTag();
													}
												}}
											/>
											<Button size="sm" variant="outline" onClick={addTag}>
												<LuPlus />
											</Button>
										</HStack>
									) : null}
								</Field.Root>

								<Field.Root required>
									<Field.Label>Responsáveis</Field.Label>
									<Box
										borderWidth="1px"
										borderColor="border"
										borderRadius="lg"
										p={3}
										maxH="160px"
										overflowY="auto"
									>
										<VStack align="stretch" gap={2}>
											{users.map((u) => (
												<Checkbox.Root
													key={u.id}
													checked={assigneeIds.includes(u.id)}
													disabled={readOnly}
													onCheckedChange={(e) =>
														setAssignee(u.id, e.checked === true)
													}
												>
													<Checkbox.HiddenInput />
													<Checkbox.Control />
													<Checkbox.Label>
														{u.name} ({u.email})
													</Checkbox.Label>
												</Checkbox.Root>
											))}
										</VStack>
									</Box>
								</Field.Root>

								{mode === "edit" && card ? (
									<>
										<Text fontSize="xs" color="fg.muted">
											Criado em{" "}
											{new Date(card.createdAt).toLocaleString("pt-BR")}
										</Text>

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
															void handleToggleChecklist(
																item.id,
																e.checked === true,
															);
														}}
														flex="1"
													>
														<Checkbox.HiddenInput />
														<Checkbox.Control />
														<Checkbox.Label
															textDecoration={
																item.done ? "line-through" : undefined
															}
														>
															{item.title}
														</Checkbox.Label>
													</Checkbox.Root>
													{allowEdit ? (
														<IconButton
															aria-label="Remover item"
															size="xs"
															variant="ghost"
															colorPalette="red"
															onClick={() =>
																void handleRemoveChecklist(item.id)
															}
														>
															<LuTrash2 />
														</IconButton>
													) : null}
												</HStack>
											))}
											{allowEdit ? (
												<HStack gap={2}>
													<Input
														value={checklistTitle}
														onChange={(e) => setChecklistTitle(e.target.value)}
														placeholder="Novo item"
														size="sm"
													/>
													<Button
														size="sm"
														onClick={() => void handleAddChecklist()}
													>
														Adicionar
													</Button>
												</HStack>
											) : null}
										</Stack>

										<Stack gap={2}>
											<Text fontWeight="600" fontSize="sm">
												Observações / histórico
											</Text>
											{allowEdit ? (
												<HStack gap={2} align="start">
													<Textarea
														value={observation}
														onChange={(e) => setObservation(e.target.value)}
														placeholder="Nova observação"
														rows={2}
														flex="1"
													/>
													<Button
														onClick={() => void handleAddObservation()}
														alignSelf="stretch"
													>
														Registrar
													</Button>
												</HStack>
											) : null}
											<VStack
												align="stretch"
												gap={2}
												maxH="220px"
												overflowY="auto"
												borderWidth="1px"
												borderColor="border"
												borderRadius="lg"
												p={3}
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
								) : null}
							</Stack>
						)}
					</Dialog.Body>
					<Dialog.Footer>
						<HStack gap={2} width="full" justify="space-between">
							{mode === "edit" && allowEdit ? (
								<Button
									variant="outline"
									colorPalette="red"
									onClick={() => void handleDeleteCard()}
								>
									Excluir
								</Button>
							) : (
								<Box />
							)}
							<HStack gap={2}>
								<Dialog.ActionTrigger asChild>
									<Button variant="outline">Fechar</Button>
								</Dialog.ActionTrigger>
								{allowEdit ? (
									<Button
										loading={saving}
										onClick={() => void handleSave()}
										colorPalette="helios"
									>
										Salvar
									</Button>
								) : null}
							</HStack>
						</HStack>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
