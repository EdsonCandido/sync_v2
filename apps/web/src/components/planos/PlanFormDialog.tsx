import {
	Button,
	Dialog,
	Field,
	HStack,
	Input,
	Stack,
	Textarea,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import z from "zod";

import type { Plan, PlanInput } from "@/lib/plans-api";

const planFormSchema = z
	.object({
		name: z.string().min(1, "Obrigatório"),
		description: z.string().optional(),
		startDate: z.string().min(1, "Obrigatório"),
		endDate: z.string().min(1, "Obrigatório"),
	})
	.refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
		message: "Data final deve ser posterior à data inicial",
		path: ["endDate"],
	});

type PlanFormValues = z.infer<typeof planFormSchema>;

type PlanFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit" | "view";
	plan?: Plan | null;
	onSubmit: (values: PlanInput) => Promise<void>;
};

function toDateInput(value: string) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

const emptyValues: PlanFormValues = {
	name: "",
	description: "",
	startDate: "",
	endDate: "",
};

export function PlanFormDialog({
	open,
	onOpenChange,
	mode,
	plan,
	onSubmit,
}: PlanFormDialogProps) {
	const readOnly = mode === "view";

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			if (readOnly) return;
			await onSubmit({
				name: value.name,
				description: value.description || null,
				startDate: value.startDate,
				endDate: value.endDate,
			});
		},
		validators: {
			onSubmit: planFormSchema,
		},
	});

	useEffect(() => {
		if (!open) return;
		if (plan) {
			form.reset({
				name: plan.name,
				description: plan.description ?? "",
				startDate: toDateInput(plan.startDate),
				endDate: toDateInput(plan.endDate),
			});
		} else {
			const today = new Date();
			const end = new Date(today);
			end.setDate(end.getDate() + 365);
			form.reset({
				name: "",
				description: "",
				startDate: today.toISOString().slice(0, 10),
				endDate: end.toISOString().slice(0, 10),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, plan]);

	const title =
		mode === "create"
			? "Novo plano"
			: mode === "edit"
				? "Editar plano"
				: "Visualizar plano";

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
			size="lg"
			scrollBehavior="inside"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel">
					<Dialog.Header>
						<Dialog.Title>{title}</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<form
							id="plan-form"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<Stack gap={4}>
								<form.Field name="name">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>Nome</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
											/>
											<Field.ErrorText>
												{String(
													field.state.meta.errors[0]?.message ??
														field.state.meta.errors[0] ??
														"",
												)}
											</Field.ErrorText>
										</Field.Root>
									)}
								</form.Field>
								<form.Field name="description">
									{(field) => (
										<Field.Root>
											<Field.Label>Descrição</Field.Label>
											<Textarea
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												rows={3}
											/>
										</Field.Root>
									)}
								</form.Field>
								<HStack
									align="start"
									gap={4}
									flexDir={{ base: "column", md: "row" }}
								>
									<form.Field name="startDate">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<Field.Label>Data início</Field.Label>
												<Input
													type="date"
													value={field.state.value}
													disabled={readOnly}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
												/>
												<Field.ErrorText>
													{String(
														field.state.meta.errors[0]?.message ??
															field.state.meta.errors[0] ??
															"",
													)}
												</Field.ErrorText>
											</Field.Root>
										)}
									</form.Field>
									<form.Field name="endDate">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<Field.Label>Data fim</Field.Label>
												<Input
													type="date"
													value={field.state.value}
													disabled={readOnly}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
												/>
												<Field.ErrorText>
													{String(
														field.state.meta.errors[0]?.message ??
															field.state.meta.errors[0] ??
															"",
													)}
												</Field.ErrorText>
											</Field.Root>
										)}
									</form.Field>
								</HStack>
							</Stack>
						</form>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Fechar</Button>
						</Dialog.ActionTrigger>
						{!readOnly && (
							<form.Subscribe selector={(s) => s.isSubmitting}>
								{(isSubmitting) => (
									<Button
										type="submit"
										form="plan-form"
										bg="helios.solid"
										color="helios.contrast"
										loading={isSubmitting}
									>
										Salvar
									</Button>
								)}
							</form.Subscribe>
						)}
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
