import {
	Badge,
	Button,
	ButtonGroup,
	Dialog,
	HStack,
	Spinner,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { LuCalendar, LuTable } from "react-icons/lu";

import { AppointmentCalendarView } from "@/components/agendamentos/AppointmentCalendarView";
import { AppointmentFormDialog } from "@/components/agendamentos/AppointmentFormDialog";
import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { PageHeader } from "@/components/ui/PageHeader";
import { toaster } from "@/components/ui/toaster";
import {
	type Appointment,
	type AppointmentInput,
	agendamentosApi,
} from "@/lib/agendamentos-api";
import { ApiError } from "@/lib/api";

type ViewMode = "calendar" | "table";

const SLOT_LABELS: Record<Appointment["slotKind"], string> = {
	timed: "Horário",
	all_day: "Dia todo",
	morning: "Manhã",
	afternoon: "Tarde",
};

function formatWhen(a: Appointment) {
	const d = new Date(a.date).toLocaleDateString("pt-BR");
	if (a.slotKind === "timed" && a.startsAt) {
		const t = new Date(a.startsAt).toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
		return `${d} · ${t}`;
	}
	return `${d} · ${SLOT_LABELS[a.slotKind]}`;
}

function AgendamentosPageContent() {
	const { canEdit } = useModuleAccess();
	const allowEdit = canEdit("agendamentos");

	const [view, setView] = useState<ViewMode>("calendar");
	const [month, setMonth] = useState(() => {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), 1);
	});
	const [items, setItems] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<"create" | "edit">("create");
	const [selected, setSelected] = useState<Appointment | null>(null);
	const [defaultDate, setDefaultDate] = useState<Date | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const from = new Date(month.getFullYear(), month.getMonth(), 1);
			const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
			to.setHours(23, 59, 59, 999);
			const result = await agendamentosApi.list({
				from: from.toISOString(),
				to: to.toISOString(),
			});
			setItems(result.items);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao listar agendamentos",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}, [month]);

	useEffect(() => {
		void load();
	}, [load]);

	function openCreate(day?: Date) {
		setFormMode("create");
		setSelected(null);
		setDefaultDate(day ?? null);
		setFormOpen(true);
	}

	function openEdit(a: Appointment) {
		setFormMode("edit");
		setSelected(a);
		setDefaultDate(null);
		setFormOpen(true);
	}

	async function handleSubmit(values: AppointmentInput) {
		try {
			if (formMode === "create") {
				await agendamentosApi.create(values);
				toaster.create({ title: "Agendamento criado", type: "success" });
			} else if (selected) {
				await agendamentosApi.update(selected.id, values);
				toaster.create({ title: "Agendamento atualizado", type: "success" });
			}
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao salvar",
				type: "error",
			});
			throw error;
		}
	}

	async function handleDelete() {
		if (!selected) return;
		try {
			await agendamentosApi.remove(selected.id);
			toaster.create({ title: "Agendamento excluído", type: "success" });
			setDeleteOpen(false);
			setSelected(null);
			await load();
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao excluir",
				type: "error",
			});
		}
	}

	return (
		<Stack gap={6} maxW="6xl" mx="auto">
			<HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
				<PageHeader
					eyebrow="Agenda"
					title="Agendamentos"
					description="Reserve horários, blocos do dia e ative lembretes."
				/>
				<HStack gap={2} flexWrap="wrap">
					<ButtonGroup size="sm" attached variant="outline">
						<Button
							variant={view === "calendar" ? "solid" : "outline"}
							colorPalette={view === "calendar" ? "helios" : undefined}
							onClick={() => setView("calendar")}
							aria-pressed={view === "calendar"}
						>
							<LuCalendar />
							Calendário
						</Button>
						<Button
							variant={view === "table" ? "solid" : "outline"}
							colorPalette={view === "table" ? "helios" : undefined}
							onClick={() => setView("table")}
							aria-pressed={view === "table"}
						>
							<LuTable />
							Tabela
						</Button>
					</ButtonGroup>
					{allowEdit ? (
						<Button colorPalette="helios" onClick={() => openCreate()}>
							Novo agendamento
						</Button>
					) : null}
				</HStack>
			</HStack>

			{loading ? (
				<HStack justify="center" py={12}>
					<Spinner />
				</HStack>
			) : view === "calendar" ? (
				<AppointmentCalendarView
					items={items}
					month={month}
					onMonthChange={setMonth}
					onSelectAppointment={openEdit}
					onSelectDay={(day) => openCreate(day)}
					allowEdit={allowEdit}
				/>
			) : items.length === 0 ? (
				<Text color="fg.muted">Nenhum agendamento neste mês.</Text>
			) : (
				<Table.Root size="sm" variant="outline" rounded="xl">
					<Table.Header>
						<Table.Row>
							<Table.ColumnHeader>Título</Table.ColumnHeader>
							<Table.ColumnHeader>Quando</Table.ColumnHeader>
							<Table.ColumnHeader>Lembrete</Table.ColumnHeader>
							<Table.ColumnHeader textAlign="end">Ações</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{items.map((a) => (
							<Table.Row key={a.id}>
								<Table.Cell fontWeight="600">{a.title}</Table.Cell>
								<Table.Cell>{formatWhen(a)}</Table.Cell>
								<Table.Cell>
									{a.remindEnabled ? (
										<Badge colorPalette="helios" variant="subtle">
											ativo
										</Badge>
									) : (
										<Text color="fg.muted" fontSize="sm">
											—
										</Text>
									)}
								</Table.Cell>
								<Table.Cell>
									<HStack justify="flex-end" gap={2}>
										{allowEdit ? (
											<>
												<Button
													size="xs"
													variant="ghost"
													onClick={() => openEdit(a)}
												>
													Editar
												</Button>
												<Button
													size="xs"
													variant="ghost"
													colorPalette="red"
													onClick={() => {
														setSelected(a);
														setDeleteOpen(true);
													}}
												>
													Excluir
												</Button>
											</>
										) : null}
									</HStack>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			)}

			{view === "table" && !loading ? (
				<HStack justify="space-between">
					<Button
						size="sm"
						variant="ghost"
						onClick={() =>
							setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
						}
					>
						Mês anterior
					</Button>
					<Text fontSize="sm" color="fg.muted" textTransform="capitalize">
						{month.toLocaleDateString("pt-BR", {
							month: "long",
							year: "numeric",
						})}
					</Text>
					<Button
						size="sm"
						variant="ghost"
						onClick={() =>
							setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
						}
					>
						Próximo mês
					</Button>
				</HStack>
			) : null}

			<AppointmentFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				initial={selected}
				defaultDate={defaultDate}
				onSubmit={handleSubmit}
			/>

			<Dialog.Root
				open={deleteOpen}
				onOpenChange={(e) => setDeleteOpen(e.open)}
			>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Excluir agendamento?</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text>
								{selected
									? `Remover “${selected.title}”? Esta ação é um soft-delete.`
									: ""}
							</Text>
						</Dialog.Body>
						<Dialog.Footer>
							<Button variant="outline" onClick={() => setDeleteOpen(false)}>
								Cancelar
							</Button>
							<Button colorPalette="red" onClick={() => void handleDelete()}>
								Excluir
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</Stack>
	);
}

export default function DashboardAgendamentos() {
	return (
		<ModuleGate moduleKey="agendamentos">
			<AgendamentosPageContent />
		</ModuleGate>
	);
}
