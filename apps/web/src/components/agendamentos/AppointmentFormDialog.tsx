import {
	Button,
	Checkbox,
	Dialog,
	Field,
	Input,
	NativeSelect,
	Stack,
	Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import type {
	Appointment,
	AppointmentInput,
	AppointmentSlotKind,
} from "@/lib/agendamentos-api";

type AppointmentFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initial?: Appointment | null;
	/** Prefill date when creating from calendar day click */
	defaultDate?: Date | null;
	onSubmit: (values: AppointmentInput) => Promise<void>;
};

function toDateInput(value: string | Date) {
	const d = typeof value === "string" ? new Date(value) : value;
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function toTimeInput(value: string | null) {
	if (!value) return "09:00";
	const d = new Date(value);
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AppointmentFormDialog({
	open,
	onOpenChange,
	mode,
	initial,
	defaultDate,
	onSubmit,
}: AppointmentFormDialogProps) {
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [slotKind, setSlotKind] = useState<AppointmentSlotKind>("timed");
	const [date, setDate] = useState(toDateInput(new Date()));
	const [time, setTime] = useState("09:00");
	const [remindEnabled, setRemindEnabled] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		if (initial) {
			setTitle(initial.title);
			setNotes(initial.notes ?? "");
			setSlotKind(initial.slotKind);
			setDate(toDateInput(initial.date));
			setTime(toTimeInput(initial.startsAt));
			setRemindEnabled(initial.remindEnabled);
		} else {
			setTitle("");
			setNotes("");
			setSlotKind("timed");
			setDate(toDateInput(defaultDate ?? new Date()));
			setTime("09:00");
			setRemindEnabled(false);
		}
	}, [open, initial, defaultDate]);

	async function handleSave() {
		if (!title.trim()) return;
		setSaving(true);
		try {
			let startsAt: string | null = null;
			const endsAt: string | null = null;
			if (slotKind === "timed") {
				startsAt = new Date(`${date}T${time}:00`).toISOString();
			}
			await onSubmit({
				title: title.trim(),
				notes: notes.trim() || null,
				slotKind,
				date: new Date(`${date}T12:00:00`).toISOString(),
				startsAt,
				endsAt,
				remindEnabled,
			});
			onOpenChange(false);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
			size="md"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>
							{mode === "create" ? "Novo agendamento" : "Editar agendamento"}
						</Dialog.Title>
					</Dialog.Header>
					<Dialog.Body>
						<Stack gap={4}>
							<Field.Root required>
								<Field.Label>Título</Field.Label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Reunião, visita..."
								/>
							</Field.Root>
							<Field.Root>
								<Field.Label>Tipo de reserva</Field.Label>
								<NativeSelect.Root>
									<NativeSelect.Field
										value={slotKind}
										onChange={(e) =>
											setSlotKind(e.target.value as AppointmentSlotKind)
										}
									>
										<option value="timed">Horário específico</option>
										<option value="all_day">Dia todo</option>
										<option value="morning">Manhã toda (08h–12h)</option>
										<option value="afternoon">Tarde toda (12h–18h)</option>
									</NativeSelect.Field>
								</NativeSelect.Root>
							</Field.Root>
							<Field.Root required>
								<Field.Label>Data</Field.Label>
								<Input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
								/>
							</Field.Root>
							{slotKind === "timed" ? (
								<Field.Root required>
									<Field.Label>Horário</Field.Label>
									<Input
										type="time"
										value={time}
										onChange={(e) => setTime(e.target.value)}
									/>
								</Field.Root>
							) : null}
							<Field.Root>
								<Field.Label>Notas</Field.Label>
								<Textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									rows={3}
								/>
							</Field.Root>
							<Checkbox.Root
								checked={remindEnabled}
								onCheckedChange={(e) => setRemindEnabled(!!e.checked)}
							>
								<Checkbox.HiddenInput />
								<Checkbox.Control>
									<Checkbox.Indicator />
								</Checkbox.Control>
								<Checkbox.Label>Lembrar-me</Checkbox.Label>
							</Checkbox.Root>
						</Stack>
					</Dialog.Body>
					<Dialog.Footer>
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button
							colorPalette="helios"
							loading={saving}
							onClick={() => void handleSave()}
						>
							Salvar
						</Button>
					</Dialog.Footer>
					<Dialog.CloseTrigger />
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
