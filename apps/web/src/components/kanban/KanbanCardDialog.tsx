import {
	Box,
	Button,
	Dialog,
	Field,
	HStack,
	IconButton,
	Input,
	SimpleGrid,
	Stack,
	Text,
	Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuBanknote, LuPlus, LuX } from "react-icons/lu";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { FinancialEntryFormDialog } from "@/components/financeiro/FinancialEntryFormDialog";
import { KanbanCardDialogClientColumn } from "@/components/kanban/KanbanCardDialogClientColumn";
import { KanbanCardDialogHistoryColumn } from "@/components/kanban/KanbanCardDialogHistoryColumn";
import {
	KanbanCardDialogPhaseColumn,
	type PhaseColumnOption,
} from "@/components/kanban/KanbanCardDialogPhaseColumn";
import { KanbanRecreateCardDialog } from "@/components/kanban/KanbanRecreateCardDialog";
import { TagBadge } from "@/components/kanban/TagBadge";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type CreateKanbanCardInput,
	type KanbanCard,
	type KanbanCardDetail,
	kanbanApi,
	type RecreateKanbanCardResponse,
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
	columns: PhaseColumnOption[];
	currentBoardId: string | null;
	onSaved: () => Promise<void>;
	onRecreated?: (result: RecreateKanbanCardResponse) => void | Promise<void>;
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
	columns,
	currentBoardId,
	onSaved,
	onRecreated,
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
	const [moving, setMoving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [financeOpen, setFinanceOpen] = useState(false);
	const [recreateOpen, setRecreateOpen] = useState(false);
	const { canEdit } = useModuleAccess();
	const canFinanceEdit = canEdit("financeiro");

	const readOnly = !allowEdit;
	const currentColumnId = detail?.columnId ?? card?.columnId ?? columnId;
	const currentColumn = columns.find((c) => c.id === currentColumnId);
	const canRecreate =
		mode === "edit" &&
		allowEdit &&
		!!card &&
		!!currentBoardId &&
		currentColumn?.slug === "concluido";

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

	async function handleSelectPhase(targetColumnId: string) {
		if (!card || readOnly || mode !== "edit") return;
		if (targetColumnId === currentColumnId) return;

		const targetColumn = columns.find((c) => c.id === targetColumnId);
		const position = targetColumn?.cardCount ?? 0;

		setMoving(true);
		try {
			await kanbanApi.moveCard(card.id, {
				columnId: targetColumnId,
				position,
			});
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			toaster.create({ title: "Fase atualizada", type: "success" });
			await onSaved();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao mover card",
				type: "error",
			});
		} finally {
			setMoving(false);
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

	async function handleUploadAttachments(files: FileList | null) {
		if (!card || !files?.length || readOnly) return;
		setUploading(true);
		try {
			for (const file of Array.from(files)) {
				await kanbanApi.uploadAttachment(card.id, file);
			}
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			toaster.create({ title: "Anexo(s) enviado(s)", type: "success" });
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao enviar anexo",
				type: "error",
			});
		} finally {
			setUploading(false);
		}
	}

	async function handleDownloadAttachment(
		attachmentId: string,
		fallbackName: string,
	) {
		if (!card) return;
		try {
			const { blob, filename } = await kanbanApi.downloadAttachment(
				card.id,
				attachmentId,
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename || fallbackName;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao baixar anexo",
				type: "error",
			});
		}
	}

	async function handleRemoveAttachment(attachmentId: string) {
		if (!card || readOnly) return;
		try {
			await kanbanApi.removeAttachment(card.id, attachmentId);
			const d = await kanbanApi.getCard(card.id);
			setDetail(d);
			await onSaved();
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao remover anexo",
				type: "error",
			});
		}
	}

	const history = detail?.history ?? [];
	const checklist = detail?.checklistItems ?? card?.checklistItems ?? [];
	const attachments = detail?.attachments ?? [];
	const clientDetail =
		detail?.client && detail.client.id === clientId ? detail.client : null;

	return (
		<>
			<Dialog.Root
				open={open}
				onOpenChange={(e) => onOpenChange(e.open)}
				scrollBehavior="inside"
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content
						borderRadius="2xl"
						w={{ base: "100%", lg: "90vw" }}
						maxW="6xl"
						minH={{ base: "auto", lg: "70vh" }}
					>
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
									<SimpleGrid
										columns={{ base: 1, md: 2 }}
										gap={3}
										alignItems="start"
										gridTemplateColumns={{ base: "1fr", md: "7fr 3fr" }}
									>
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
											<Field.Label>Previsão de conclusão</Field.Label>
											<Input
												type="date"
												value={dueAt}
												onChange={(e) => setDueAt(e.target.value)}
												disabled={readOnly}
											/>
										</Field.Root>
									</SimpleGrid>

									<Field.Root>
										<Field.Label>Tags</Field.Label>
										<Wrap gap={2} mb={tagNames.length > 0 ? 2 : 0}>
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
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addTag();
														}
													}}
												/>
												<Button variant="outline" onClick={addTag}>
													<LuPlus />
												</Button>
											</HStack>
										) : null}
									</Field.Root>

									<SimpleGrid
										columns={{ base: 1, lg: 3 }}
										gap={4}
										alignItems="start"
										gridTemplateColumns={{
											base: "1fr",
											lg: "1.15fr 1.15fr 0.7fr",
										}}
									>
										<KanbanCardDialogClientColumn
											clientId={clientId}
											onClientIdChange={setClientId}
											clients={clients}
											clientDetail={clientDetail}
											description={description}
											onDescriptionChange={setDescription}
											readOnly={readOnly}
										/>

										<KanbanCardDialogHistoryColumn
											mode={mode}
											readOnly={readOnly}
											users={users}
											assigneeIds={assigneeIds}
											onAssigneeIdsChange={setAssigneeIds}
											createdAt={card?.createdAt}
											history={history}
											observation={observation}
											onObservationChange={setObservation}
											onAddObservation={() => void handleAddObservation()}
											checklist={checklist}
											checklistTitle={checklistTitle}
											onChecklistTitleChange={setChecklistTitle}
											onAddChecklist={() => void handleAddChecklist()}
											onToggleChecklist={(id, done) =>
												void handleToggleChecklist(id, done)
											}
											onRemoveChecklist={(id) => void handleRemoveChecklist(id)}
											attachments={attachments}
											uploading={uploading}
											onUploadAttachments={(files) =>
												void handleUploadAttachments(files)
											}
											onDownloadAttachment={(id, name) =>
												void handleDownloadAttachment(id, name)
											}
											onRemoveAttachment={(id) =>
												void handleRemoveAttachment(id)
											}
										/>

										<KanbanCardDialogPhaseColumn
											columns={columns}
											currentColumnId={currentColumnId}
											disabled={mode !== "edit" || !card}
											moving={moving}
											onSelectPhase={(id) => void handleSelectPhase(id)}
										/>
									</SimpleGrid>
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
								<HStack gap={2} flexWrap="wrap" justify="flex-end">
									{canRecreate ? (
										<Button
											variant="outline"
											onClick={() => setRecreateOpen(true)}
										>
											Recriar em outro kanban
										</Button>
									) : null}
									{mode === "edit" && card && canFinanceEdit ? (
										<Button
											variant="outline"
											onClick={() => setFinanceOpen(true)}
										>
											<LuBanknote />
											Lançar no financeiro
										</Button>
									) : null}
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
			{card ? (
				<FinancialEntryFormDialog
					open={financeOpen}
					onOpenChange={setFinanceOpen}
					kind="receber"
					defaults={{
						kanbanCardId: card.id,
						originType: "kanban",
						originLabel: title || card.title,
						clientId: clientId || card.clientId || undefined,
					}}
					onCreated={() => {
						toaster.create({
							title: "Lançamento criado a partir do card",
							type: "success",
						});
					}}
				/>
			) : null}
			{card && currentBoardId ? (
				<KanbanRecreateCardDialog
					open={recreateOpen}
					onOpenChange={setRecreateOpen}
					cardId={card.id}
					currentBoardId={currentBoardId}
					defaultAssigneeIds={assigneeIds}
					users={users}
					onRecreated={async (result) => {
						onOpenChange(false);
						await onRecreated?.(result);
					}}
				/>
			) : null}
		</>
	);
}
