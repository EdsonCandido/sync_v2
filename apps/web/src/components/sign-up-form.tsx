import {
	Button,
	Container,
	Field,
	Heading,
	Input,
	Stack,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router";
import z from "zod";

import { toaster } from "@/components/ui/toaster";
import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate("/dashboard");
						toaster.create({ title: "Sign up successful", type: "success" });
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
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<Container maxW="md" mt={10} p={6}>
			<Heading as="h1" size="2xl" textAlign="center" mb={6}>
				Create Account
			</Heading>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Stack gap={4}>
					<form.Field name="name">
						{(field) => {
							const error = field.state.meta.errors[0]?.message;
							return (
								<Field.Root invalid={!!error}>
									<Field.Label htmlFor={field.name}>Name</Field.Label>
									<Input
										id={field.name}
										name={field.name}
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
									<Field.Label htmlFor={field.name}>Email</Field.Label>
									<Input
										id={field.name}
										name={field.name}
										type="email"
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
									<Field.Label htmlFor={field.name}>Password</Field.Label>
									<Input
										id={field.name}
										name={field.name}
										type="password"
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
								w="full"
								disabled={!canSubmit || isSubmitting}
							>
								{isSubmitting ? "Submitting..." : "Sign Up"}
							</Button>
						)}
					</form.Subscribe>
				</Stack>
			</form>

			<Button
				variant="plain"
				colorPalette="blue"
				mt={4}
				mx="auto"
				display="block"
				onClick={onSwitchToSignIn}
			>
				Already have an account? Sign In
			</Button>
		</Container>
	);
}
