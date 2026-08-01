import {
	Button,
	Container,
	Field,
	Heading,
	Input,
	Stack,
	Text,
	Textarea,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { Link } from "react-router";
import z from "zod";

import { toaster } from "@/components/ui/toaster";

import type { Route } from "./+types/contato";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Contato — Helios Labs" },
		{
			name: "description",
			content: "Fale com a Helios Labs. Em breve entraremos em contato.",
		},
	];
}

export default function Contato() {
	const form = useForm({
		defaultValues: {
			nome: "",
			email: "",
			comentario: "",
		},
		onSubmit: async ({ formApi }) => {
			toaster.create({
				title: "Em breve entraremos em contato.",
				type: "success",
			});
			formApi.reset();
		},
		validators: {
			onSubmit: z.object({
				nome: z.string().min(2, "Informe seu nome"),
				email: z.email("E-mail inválido"),
				comentario: z.string().min(5, "Escreva um comentário"),
			}),
		},
	});

	return (
		<Container maxW="md" px={5} py={{ base: 10, md: 16 }}>
			<Stack gap={6}>
				<Stack gap={2}>
					<Heading as="h1" size="2xl" letterSpacing="-0.02em">
						Contato
					</Heading>
					<Text color="fg.muted">
						Deixe seu nome, e-mail e um comentário. Retornamos em breve.
					</Text>
				</Stack>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<Stack gap={4}>
						<form.Field name="nome">
							{(field) => {
								const error = field.state.meta.errors[0]?.message;
								return (
									<Field.Root invalid={!!error}>
										<Field.Label htmlFor={field.name}>Nome</Field.Label>
										<Input
											id={field.name}
											name={field.name}
											autoComplete="name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{error && <Field.ErrorText>{error}</Field.ErrorText>}
									</Field.Root>
								);
							}}
						</form.Field>

						<form.Field name="email">
							{(field) => {
								const error = field.state.meta.errors[0]?.message;
								return (
									<Field.Root invalid={!!error}>
										<Field.Label htmlFor={field.name}>E-mail</Field.Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											autoComplete="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{error && <Field.ErrorText>{error}</Field.ErrorText>}
									</Field.Root>
								);
							}}
						</form.Field>

						<form.Field name="comentario">
							{(field) => {
								const error = field.state.meta.errors[0]?.message;
								return (
									<Field.Root invalid={!!error}>
										<Field.Label htmlFor={field.name}>Comentário</Field.Label>
										<Textarea
											id={field.name}
											name={field.name}
											rows={4}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{error && <Field.ErrorText>{error}</Field.ErrorText>}
									</Field.Root>
								);
							}}
						</form.Field>

						<form.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
							})}
						>
							{({ canSubmit, isSubmitting }) => (
								<Button
									type="submit"
									colorPalette="helios"
									w="full"
									disabled={!canSubmit || isSubmitting}
								>
									{isSubmitting ? "Enviando..." : "Enviar"}
								</Button>
							)}
						</form.Subscribe>
					</Stack>
				</form>

				<Button
					asChild
					variant="plain"
					colorPalette="helios"
					alignSelf="flex-start"
				>
					<Link to="/">Voltar ao início</Link>
				</Button>
			</Stack>
		</Container>
	);
}
