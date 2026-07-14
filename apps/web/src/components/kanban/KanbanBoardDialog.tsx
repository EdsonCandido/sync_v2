import {
	Box,
	Button,
	Checkbox,
	CheckboxGroup,
	Dialog,
	Field,
	Fieldset,
	Input,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { type KanbanBoardSummary, kanbanApi } from "@/lib/kanban-api";

type FilterUser = { id: string; name: string; email: string };

type KanbanBoardDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	board: KanbanBoardSummary | null;
	users: FilterUser[];
	onSaved: (board?: KanbanBoardSummary) => void | Promise<void>;
};

export function KanbanBoardDialog({
	open,
	onOpenChange,
	mode,
	board,
	users,
	onSaved,
}: KanbanBoardDialogProps) {
	const [name, setName] = useState("");
	const [priority, setPriority] = useState("0");
	const [memberIds, setMemberIds] = useState<string[]>([]);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		if (mode === "edit" && board) {
			setName(board.name);
			setPriority(String(board.priority));
			setMemberIds(board.memberUserIds);
		} else {
			setName("");
			setPriority("0");
			setMemberIds([]);
		}
	}, [open, mode, board]);

	async function handleSave() {
		const trimmed = name.trim();
		if (!trimmed) {
			toaster.create({ title: "Nome obrigatório", type: "error" });
			return;
		}
		const priorityNum = Number.parseInt(priority, 10);
		if (Number.isNaN(priorityNum) || priorityNum < 0) {
			toaster.create({ title: "Prioridade inválida", type: "error" });
			return;
		}
		if (mode === "create" && memberIds.length === 0) {
			toaster.create({
				title: "Selecione ao menos um usuário com acesso",
				type: "error",
			});
			return;
		}

		setSaving(true);
		try {
			if (mode === "create") {
				const created = await kanbanApi.createBoard({
					name: trimmed,
					priority: priorityNum,
					memberUserIds: memberIds,
				});
				toaster.create({ title: "Kanban criado", type: "success" });
				onOpenChange(false);
				await onSaved(created);
			} else if (board) {
				const updated = await kanbanApi.updateBoard(board.id, {
					name: trimmed,
					priority: priorityNum,
					memberUserIds: board.isDefault ? undefined : memberIds,
				});
				toaster.create({ title: "Kanban atualizado", type: "success" });
				onOpenChange(false);
				await onSaved(updated);
			}
		} catch (err) {
			toaster.create({
				title: err instanceof ApiError ? err.message : "Erro ao salvar kanban",
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
				<Dialog.Content borderRadius="2xl">
					<Dialog.Header>
						<Dialog.Title>
							{mode === "create" ? "Novo kanban" : "Editar kanban"}
						</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							<Field.Root>
								<Field.Label>Nome</Field.Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Ex.: Marketing"
								/>
							</Field.Root>
							<Field.Root>
								<Field.Label>Prioridade (menor = mais alto)</Field.Label>
								<Input
									type="number"
									min={0}
									value={priority}
									onChange={(e) => setPriority(e.target.value)}
								/>
							</Field.Root>
							{board?.isDefault ? (
								<Text fontSize="sm" color="fg.muted">
									Kanban default: todos com acesso ao módulo veem este board.
								</Text>
							) : (
								<Fieldset.Root>
									<Fieldset.Legend>Usuários com acesso</Fieldset.Legend>
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
											maxH="220px"
											overflowY="auto"
										>
											<CheckboxGroup
												value={memberIds}
												onValueChange={setMemberIds}
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
							)}
						</Stack>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Cancelar</Button>
						</Dialog.ActionTrigger>
						<Button
							colorPalette="helios"
							loading={saving}
							onClick={() => void handleSave()}
						>
							Salvar
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
