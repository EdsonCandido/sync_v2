import {
	Button,
	Checkbox,
	Container,
	Field,
	Heading,
	HStack,
	IconButton,
	Input,
	InputGroup,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import z from "zod";

import { toaster } from "@/components/ui/toaster";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm() {
	const navigate = useNavigate();
	const { data: session, isPending, refetch } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (!isPending && session) {
			navigate("/dashboard", { replace: true });
		}
	}, [session, isPending, navigate]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
					rememberMe: value.rememberMe,
				},
				{
					onSuccess: async () => {
						await refetch();
						toaster.create({
							title: "Login realizado com sucesso",
							type: "success",
						});
						navigate("/dashboard");
					},
					onError: (error) => {
						toaster.create({
							title: error.error.message || error.error.statusText,
							type: "error",
						});
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("E-mail inválido"),
				password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
				rememberMe: z.boolean(),
			}),
		},
	});

	if (isPending || session) {
		return <Loader />;
	}

	return (
		<Container maxW="md" mt={{ base: 8, md: 12 }} px={5} pb={10}>
			<Stack gap={6}>
				<Stack gap={2} textAlign="center">
					<Heading as="h1" size="2xl" letterSpacing="-0.02em">
						Entrar
					</Heading>
					<Text color="fg.muted">Acesse com seu e-mail e senha</Text>
				</Stack>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<Stack gap={4}>
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

						<form.Field name="password">
							{(field) => {
								const error = field.state.meta.errors[0]?.message;
								return (
									<Field.Root invalid={!!error}>
										<Field.Label htmlFor={field.name}>Senha</Field.Label>
										<InputGroup
											endElement={
												<IconButton
													type="button"
													variant="ghost"
													size="sm"
													me="-2"
													aria-label={
														showPassword ? "Ocultar senha" : "Mostrar senha"
													}
													onClick={() => setShowPassword((prev) => !prev)}
												>
													{showPassword ? <LuEyeOff /> : <LuEye />}
												</IconButton>
											}
										>
											<Input
												id={field.name}
												name={field.name}
												type={showPassword ? "text" : "password"}
												autoComplete="current-password"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</InputGroup>
										{error && <Field.ErrorText>{error}</Field.ErrorText>}
									</Field.Root>
								);
							}}
						</form.Field>

						<HStack
							justify="space-between"
							align="center"
							flexWrap="wrap"
							gap={2}
						>
							<form.Field name="rememberMe">
								{(field) => (
									<Checkbox.Root
										checked={field.state.value}
										onCheckedChange={(details) =>
											field.handleChange(details.checked === true)
										}
									>
										<Checkbox.HiddenInput />
										<Checkbox.Control />
										<Checkbox.Label>Lembrar-me</Checkbox.Label>
									</Checkbox.Root>
								)}
							</form.Field>

							<Button
								type="button"
								variant="plain"
								colorPalette="helios"
								size="sm"
								px={0}
								onClick={() =>
									toaster.create({
										title: "Em breve",
										description:
											"A recuperação de senha estará disponível em breve.",
										type: "info",
									})
								}
							>
								Esqueci a senha
							</Button>
						</HStack>

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
									{isSubmitting ? "Entrando..." : "Entrar"}
								</Button>
							)}
						</form.Subscribe>
					</Stack>
				</form>

				<Button asChild variant="outline" colorPalette="helios" w="full">
					<Link to="/consultar-itr">Consultar ITR</Link>
				</Button>

				<Button asChild variant="plain" colorPalette="helios" mx="auto">
					<Link to="/">Voltar ao início</Link>
				</Button>
			</Stack>
		</Container>
	);
}
