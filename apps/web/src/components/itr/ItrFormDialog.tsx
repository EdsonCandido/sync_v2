import {
	Button,
	Dialog,
	Field,
	HStack,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import z from "zod";

import { MoneyInput } from "@/components/ui/money-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { maskCpfInput, parseCpfDigits } from "@/lib/cpf";
import type { CreateItrProcessInput } from "@/lib/itr-api";
import { parseMoneyInput } from "@/lib/money";
import { maskPhoneInput, parsePhoneDigits } from "@/lib/phone";

const itrFormSchema = z.object({
	document: z
		.string()
		.refine((v) => parseCpfDigits(v).length === 11, "CPF inválido"),
	name: z.string().min(1, "Obrigatório"),
	email: z.email("E-mail inválido"),
	phone: z
		.string()
		.refine((v) => {
			const d = parsePhoneDigits(v);
			return d.length >= 10 && d.length <= 11;
		}, "Telefone inválido"),
	valor: z.string().min(1, "Obrigatório"),
	observacoes: z.string().optional(),
});

type ItrFormValues = z.infer<typeof itrFormSchema>;

type ItrFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (
		values: CreateItrProcessInput,
		files: {
			declaracao: File | null;
			recibo: File | null;
			anexos: File[];
		},
	) => Promise<void>;
};

const emptyValues: ItrFormValues = {
	document: "",
	name: "",
	email: "",
	phone: "",
	valor: "",
	observacoes: "",
};

export function ItrFormDialog({
	open,
	onOpenChange,
	onSubmit,
}: ItrFormDialogProps) {
	const [declaracao, setDeclaracao] = useState<File | null>(null);
	const [recibo, setRecibo] = useState<File | null>(null);
	const [anexos, setAnexos] = useState<File[]>([]);

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			const parsed = itrFormSchema.safeParse(value);
			if (!parsed.success) {
				toaster.create({
					title: parsed.error.issues[0]?.message ?? "Dados inválidos",
					type: "error",
				});
				return;
			}
			const valor = parseMoneyInput(parsed.data.valor);
			if (!Number.isFinite(valor) || valor <= 0) {
				toaster.create({ title: "Valor inválido", type: "error" });
				return;
			}
			try {
				await onSubmit(
					{
						document: parseCpfDigits(parsed.data.document),
						name: parsed.data.name.trim(),
						email: parsed.data.email.trim().toLowerCase(),
						phone: parsePhoneDigits(parsed.data.phone),
						valor,
						observacoes: parsed.data.observacoes?.trim() || null,
					},
					{ declaracao, recibo, anexos },
				);
				form.reset();
				setDeclaracao(null);
				setRecibo(null);
				setAnexos([]);
			} catch (error) {
				if (!(error instanceof ApiError)) {
					toaster.create({ title: "Erro ao salvar", type: "error" });
				}
				throw error;
			}
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset();
			setDeclaracao(null);
			setRecibo(null);
			setAnexos([]);
		}
	}, [open, form]);

	return (
		<Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" maxW="lg" mx={4}>
					<Dialog.Header>
						<Dialog.Title>Novo processo ITR</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<form
							id="itr-create-form"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<Stack gap={3}>
								<form.Field name="document">
									{(field) => (
										<Field.Root>
											<Field.Label>CPF</Field.Label>
											<Input
												inputMode="numeric"
												placeholder="000.000.000-00"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(maskCpfInput(e.target.value))
												}
											/>
										</Field.Root>
									)}
								</form.Field>
								<form.Field name="name">
									{(field) => (
										<Field.Root>
											<Field.Label>Nome</Field.Label>
											<Input
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field.Root>
									)}
								</form.Field>
								<HStack
									gap={3}
									align="start"
									flexDir={{ base: "column", md: "row" }}
								>
									<form.Field name="email">
										{(field) => (
											<Field.Root flex="1">
												<Field.Label>E-mail</Field.Label>
												<Input
													type="email"
													autoComplete="email"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</Field.Root>
										)}
									</form.Field>
									<form.Field name="phone">
										{(field) => (
											<Field.Root flex="1">
												<Field.Label>Telefone</Field.Label>
												<Input
													inputMode="tel"
													placeholder="(11) 98765-4321"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(maskPhoneInput(e.target.value))
													}
												/>
											</Field.Root>
										)}
									</form.Field>
								</HStack>
								<form.Field name="valor">
									{(field) => (
										<Field.Root>
											<Field.Label>Valor (R$)</Field.Label>
											<MoneyInput
												placeholder="R$ 0,00"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(masked) => field.handleChange(masked)}
											/>
										</Field.Root>
									)}
								</form.Field>
								<form.Field name="observacoes">
									{(field) => (
										<Field.Root>
											<Field.Label>Observações</Field.Label>
											<Input
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</Field.Root>
									)}
								</form.Field>
								<Field.Root>
									<Field.Label>Declaração (opcional)</Field.Label>
									<Input
										type="file"
										onChange={(e) =>
											setDeclaracao(e.target.files?.[0] ?? null)
										}
									/>
									{declaracao && (
										<Text fontSize="sm" color="fg.muted" mt={1}>
											{declaracao.name}
										</Text>
									)}
								</Field.Root>
								<Field.Root>
									<Field.Label>Recibo (opcional)</Field.Label>
									<Input
										type="file"
										onChange={(e) => setRecibo(e.target.files?.[0] ?? null)}
									/>
									{recibo && (
										<Text fontSize="sm" color="fg.muted" mt={1}>
											{recibo.name}
										</Text>
									)}
								</Field.Root>
								<Field.Root>
									<Field.Label>Anexos (opcional)</Field.Label>
									<Input
										type="file"
										multiple
										onChange={(e) =>
											setAnexos(Array.from(e.target.files ?? []))
										}
									/>
									<Text fontSize="sm" color="fg.muted" mt={1}>
										{anexos.length > 0
											? `${anexos.length} anexo(s) selecionado(s)`
											: "Adicionar outros arquivos se necessário"}
									</Text>
								</Field.Root>
							</Stack>
						</form>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.ActionTrigger asChild>
							<Button variant="outline">Cancelar</Button>
						</Dialog.ActionTrigger>
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									form="itr-create-form"
									bg="helios.solid"
									color="helios.contrast"
									loading={isSubmitting}
								>
									Cadastrar
								</Button>
							)}
						</form.Subscribe>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
