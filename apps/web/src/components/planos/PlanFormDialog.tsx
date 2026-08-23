import {
	Button,
	Dialog,
	Field,
	Input,
	Stack,
	Textarea,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import z from "zod";

import type { Plan, PlanInput } from "@/lib/plans-api";

const planFormSchema = z.object({
	name: z.string().min(1, "Obrigatório"),
	description: z.string().optional(),
	durationDays: z.number().int().min(1, "Informe ao menos 1 dia"),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

type PlanFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit" | "view";
	plan?: Plan | null;
	onSubmit: (values: PlanInput) => Promise<void>;
};

const emptyValues: PlanFormValues = {
	name: "",
	description: "",
	durationDays: 365,
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
				durationDays: value.durationDays,
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
				durationDays: plan.durationDays,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				durationDays: 365,
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
								<form.Field name="durationDays">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>Dias de validade</Field.Label>
											<Input
												type="number"
												min={1}
												step={1}
												value={
													Number.isFinite(field.state.value)
														? field.state.value
														: ""
												}
												disabled={readOnly}
												onChange={(e) => {
													const raw = e.target.value;
													if (raw === "") {
														field.handleChange(Number.NaN);
														return;
													}
													field.handleChange(Number(raw));
												}}
												onBlur={field.handleBlur}
											/>
											<Field.HelperText>
												Quantidade de dias liberados ao vincular o plano a uma
												empresa
											</Field.HelperText>
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
