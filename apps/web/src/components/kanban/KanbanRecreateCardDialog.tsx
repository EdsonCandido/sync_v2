import {
	Box,
	Button,
	Checkbox,
	CheckboxGroup,
	Dialog,
	Field,
	Fieldset,
	NativeSelect,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type KanbanBoardSummary,
	kanbanApi,
	type RecreateKanbanCardResponse,
} from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };

type KanbanRecreateCardDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cardId: string;
	currentBoardId: string;
	defaultAssigneeIds: string[];
	users: FilterUser[];
	onRecreated: (result: RecreateKanbanCardResponse) => void | Promise<void>;
};

export function KanbanRecreateCardDialog({
	open,
	onOpenChange,
	cardId,
	currentBoardId,
	defaultAssigneeIds,
	users,
	onRecreated,
}: KanbanRecreateCardDialogProps) {
	const [boards, setBoards] = useState<KanbanBoardSummary[]>([]);
	const [loadingBoards, setLoadingBoards] = useState(false);
	const [targetBoardId, setTargetBoardId] = useState("");
	const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
	const [copyHistory, setCopyHistory] = useState(false);
	const [copyChecklist, setCopyChecklist] = useState(false);
	const [copyAttachments, setCopyAttachments] = useState(false);
	const [saving, setSaving] = useState(false);
	const defaultAssigneeKey = defaultAssigneeIds.join(",");

	useEffect(() => {
		if (!open) return;
		setTargetBoardId("");
		setAssigneeIds(defaultAssigneeKey ? defaultAssigneeKey.split(",") : []);
		setCopyHistory(false);
		setCopyChecklist(false);
		setCopyAttachments(false);
		setLoadingBoards(true);
		void kanbanApi
			.listBoards()
			.then((res) => {
				setBoards(res.boards.filter((b) => b.id !== currentBoardId));
			})
			.catch((err) => {
				toaster.create({
					title:
						err instanceof ApiError ? err.message : "Erro ao carregar kanbans",
					type: "error",
				});
			})
			.finally(() => setLoadingBoards(false));
	}, [open, currentBoardId, defaultAssigneeKey]);

	async function handleConfirm() {
		if (!targetBoardId) {
			toaster.create({
				title: "Selecione o kanban de destino",
				type: "error",
			});
			return;
		}
		if (assigneeIds.length === 0) {
			toaster.create({
				title: "Selecione ao menos um responsável",
				type: "error",
			});
			return;
		}

		setSaving(true);
		try {
			const result = await kanbanApi.recreateCard(cardId, {
				targetBoardId,
				assigneeUserIds: assigneeIds,
				copyHistory,
				copyChecklist,
				copyAttachments,
			});
			toaster.create({ title: "Card recriado", type: "success" });
			onOpenChange(false);
			await onRecreated(result);
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao recriar card",
				type: "error",
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content borderRadius="2xl" maxW="md">
					<Dialog.Header>
						<Dialog.Title>Recriar em outro kanban</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							<Text fontSize="sm" color="fg.muted">
								O card atual permanece em Concluído. Um novo card nasce em A
								fazer no kanban escolhido, com o mesmo cliente.
							</Text>

							<Field.Root>
								<Field.Label>Kanban de destino</Field.Label>
								{loadingBoards ? (
									<Text fontSize="sm" color="fg.muted">
										Carregando…
									</Text>
								) : boards.length === 0 ? (
									<Text fontSize="sm" color="fg.muted">
										Nenhum outro kanban disponível.
									</Text>
								) : (
									<NativeSelect.Root>
										<NativeSelect.Field
											value={targetBoardId}
											onChange={(e) => setTargetBoardId(e.target.value)}
										>
											<option value="">Selecione…</option>
											{boards.map((b) => (
												<option key={b.id} value={b.id}>
													{b.name}
												</option>
											))}
										</NativeSelect.Field>
									</NativeSelect.Root>
								)}
							</Field.Root>

							<Fieldset.Root>
								<Fieldset.Legend>Responsáveis</Fieldset.Legend>
								{users.length === 0 ? (
									<Text fontSize="sm" color="fg.muted">
										Nenhum usuário disponível.
									</Text>
								) : (
									<Box
										borderWidth="1px"
										borderColor="border"
										borderRadius="lg"
										p={3}
										maxH="180px"
										overflowY="auto"
									>
										<CheckboxGroup
											value={assigneeIds}
											onValueChange={setAssigneeIds}
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
								)}
							</Fieldset.Root>

							<Stack gap={2}>
								<Text fontWeight="600" fontSize="sm">
									Copiar do card original
								</Text>
								<Checkbox.Root
									checked={copyHistory}
									onCheckedChange={(e) => setCopyHistory(!!e.checked)}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
									<Checkbox.Label>Levar histórico</Checkbox.Label>
								</Checkbox.Root>
								<Checkbox.Root
									checked={copyChecklist}
									onCheckedChange={(e) => setCopyChecklist(!!e.checked)}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
									<Checkbox.Label>Copiar checklist</Checkbox.Label>
								</Checkbox.Root>
								<Checkbox.Root
									checked={copyAttachments}
									onCheckedChange={(e) => setCopyAttachments(!!e.checked)}
								>
									<Checkbox.HiddenInput />
									<Checkbox.Control />
									<Checkbox.Label>Copiar anexos</Checkbox.Label>
								</Checkbox.Root>
							</Stack>
						</Stack>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Cancelar</Button>
						</Dialog.ActionTrigger>
						<Button
							colorPalette="helios"
							loading={saving}
							disabled={boards.length === 0}
							onClick={() => void handleConfirm()}
						>
							Recriar
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
