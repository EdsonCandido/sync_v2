import {
	Button,
	Dialog,
	Field,
	HStack,
	Input,
	NativeSelect,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";
import z from "zod";

import type { Company } from "@/lib/companies-api";
import type {
	AppUser,
	CreateUserInput,
	UpdateUserInput,
	UserPerfil,
} from "@/lib/users-api";

const DEPARTMENTS = [
	"Financeiro",
	"Marketing",
	"Secretaria",
	"Comercial",
	"RH",
	"Administração",
] as const;

type UserFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit" | "view";
	user?: AppUser | null;
	actorPerfil: string;
	actorCompanyId: string | null;
	companies: Company[];
	canSetPassword: boolean;
	canSetAtivo: boolean;
	onSubmit: (values: CreateUserInput | UpdateUserInput) => Promise<void>;
};

type FormValues = {
	name: string;
	email: string;
	password: string;
	perfil: UserPerfil;
	companyId: string;
	department: string;
	ativo: boolean;
};

const emptyValues: FormValues = {
	name: "",
	email: "",
	password: "",
	perfil: "cliente",
	companyId: "",
	department: "",
	ativo: true,
};

export function UserFormDialog({
	open,
	onOpenChange,
	mode,
	user,
	actorPerfil,
	actorCompanyId,
	companies,
	canSetPassword,
	canSetAtivo,
	onSubmit,
}: UserFormDialogProps) {
	const readOnly = mode === "view";
	const companyLocked = actorPerfil !== "super";
	const [saving, setSaving] = useState(false);

	const perfilOptions = useMemo(() => {
		if (actorPerfil === "super") {
			return [
				{ value: "super", label: "Super" },
				{ value: "admin_empresa", label: "Admin empresa" },
				{ value: "cliente", label: "Cliente" },
			] as const;
		}
		if (
			actorPerfil === "admin_empresa" &&
			mode === "edit" &&
			user?.perfil === "admin_empresa"
		) {
			return [
				{ value: "admin_empresa", label: "Admin empresa" },
				{ value: "cliente", label: "Cliente" },
			] as const;
		}
		return [{ value: "cliente", label: "Cliente" }] as const;
	}, [actorPerfil, mode, user?.perfil]);

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			if (readOnly) return;
			setSaving(true);
			try {
				const companyId =
					value.perfil === "super"
						? null
						: companyLocked
							? actorCompanyId
							: value.companyId || null;

				if (mode === "create") {
					const payload: CreateUserInput = {
						name: value.name.trim(),
						email: value.email.trim(),
						password: value.password,
						perfil: value.perfil,
						companyId,
						department: value.department || null,
						ativo: canSetAtivo ? value.ativo : true,
					};
					await onSubmit(payload);
				} else {
					const payload: UpdateUserInput = {
						name: value.name.trim(),
						email: value.email.trim(),
						perfil: value.perfil,
						companyId,
						department: value.department || null,
					};
					if (canSetAtivo) {
						payload.ativo = value.ativo;
					}
					if (canSetPassword && value.password.trim()) {
						payload.password = value.password;
					}
					await onSubmit(payload);
				}
			} finally {
				setSaving(false);
			}
		},
	});

	useEffect(() => {
		if (!open) return;
		if (user && mode !== "create") {
			form.reset({
				name: user.name,
				email: user.email,
				password: "",
				perfil: user.perfil,
				companyId: user.companyId ?? "",
				department: user.department ?? "",
				ativo: user.ativo,
			});
		} else {
			form.reset({
				...emptyValues,
				perfil: "cliente",
				companyId: companyLocked ? (actorCompanyId ?? "") : "",
				ativo: true,
			});
		}
	}, [open, user, mode, companyLocked, actorCompanyId, form]);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
			placement="center"
			size="lg"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" borderColor="border">
					<Dialog.Header>
						<Dialog.Title>
							{mode === "create"
								? "Novo usuário"
								: mode === "edit"
									? "Editar usuário"
									: "Usuário"}
						</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<Dialog.Body>
							<Stack gap={4}>
								<form.Field
									name="name"
									validators={{
										onChange: ({ value }) =>
											!value.trim() ? "Obrigatório" : undefined,
									}}
								>
									{(field) => (
										<Field.Root
											required
											invalid={field.state.meta.errors.length > 0}
										>
											<Field.Label>Nome</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<Field.ErrorText>
												{field.state.meta.errors[0]}
											</Field.ErrorText>
										</Field.Root>
									)}
								</form.Field>

								<form.Field
									name="email"
									validators={{
										onChange: ({ value }) => {
											const r = z.email().safeParse(value);
											return r.success ? undefined : "E-mail inválido";
										},
									}}
								>
									{(field) => (
										<Field.Root
											required
											invalid={field.state.meta.errors.length > 0}
										>
											<Field.Label>E-mail</Field.Label>
											<Input
												type="email"
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<Field.ErrorText>
												{field.state.meta.errors[0]}
											</Field.ErrorText>
										</Field.Root>
									)}
								</form.Field>

								<form.Field name="perfil">
									{(field) => (
										<Field.Root required>
											<Field.Label>Perfil</Field.Label>
											<NativeSelect.Root
												disabled={
													readOnly ||
													(actorPerfil !== "super" &&
														!(
															actorPerfil === "admin_empresa" &&
															mode === "edit" &&
															user?.perfil === "admin_empresa"
														) &&
														mode !== "create")
												}
											>
												<NativeSelect.Field
													value={field.state.value}
													onChange={(e) =>
														field.handleChange(e.target.value as UserPerfil)
													}
												>
													{perfilOptions.map((opt) => (
														<option key={opt.value} value={opt.value}>
															{opt.label}
														</option>
													))}
												</NativeSelect.Field>
											</NativeSelect.Root>
										</Field.Root>
									)}
								</form.Field>

								<form.Subscribe selector={(s) => s.values.perfil}>
									{(perfil) =>
										perfil !== "super" ? (
											<form.Field
												name="companyId"
												validators={{
													onChange: ({ value }) =>
														companyLocked || value
															? undefined
															: "Empresa obrigatória",
												}}
											>
												{(field) => (
													<Field.Root
														required
														invalid={field.state.meta.errors.length > 0}
													>
														<Field.Label>Empresa</Field.Label>
														{companyLocked ? (
															<Input
																value={
																	user?.companyName ||
																	companies.find((c) => c.id === actorCompanyId)
																		?.tradeName ||
																	actorCompanyId ||
																	""
																}
																disabled
															/>
														) : (
															<NativeSelect.Root disabled={readOnly}>
																<NativeSelect.Field
																	value={field.state.value}
																	onChange={(e) =>
																		field.handleChange(e.target.value)
																	}
																>
																	<option value="">Selecione…</option>
																	{companies.map((c) => (
																		<option key={c.id} value={c.id}>
																			{c.tradeName}
																		</option>
																	))}
																</NativeSelect.Field>
															</NativeSelect.Root>
														)}
														<Field.ErrorText>
															{field.state.meta.errors[0]}
														</Field.ErrorText>
													</Field.Root>
												)}
											</form.Field>
										) : (
											<Text fontSize="sm" color="fg.muted">
												Super não vincula empresa.
											</Text>
										)
									}
								</form.Subscribe>

								<form.Field name="department">
									{(field) => (
										<Field.Root>
											<Field.Label>Departamento</Field.Label>
											<NativeSelect.Root disabled={readOnly}>
												<NativeSelect.Field
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												>
													<option value="">Sem departamento</option>
													{DEPARTMENTS.map((d) => (
														<option key={d} value={d}>
															{d}
														</option>
													))}
												</NativeSelect.Field>
											</NativeSelect.Root>
										</Field.Root>
									)}
								</form.Field>

								{(mode === "create" || (mode === "edit" && canSetPassword)) && (
									<form.Field
										name="password"
										validators={{
											onChange: ({ value }) => {
												if (mode === "create" && value.length < 6) {
													return "Mínimo 6 caracteres";
												}
												if (mode === "edit" && value && value.length < 6) {
													return "Mínimo 6 caracteres";
												}
												return undefined;
											},
										}}
									>
										{(field) => (
											<Field.Root
												required={mode === "create"}
												invalid={field.state.meta.errors.length > 0}
											>
												<Field.Label>
													{mode === "create"
														? "Senha"
														: "Nova senha (opcional)"}
												</Field.Label>
												<Input
													type="password"
													value={field.state.value}
													disabled={readOnly}
													autoComplete="new-password"
													onChange={(e) => field.handleChange(e.target.value)}
												/>
												<Field.ErrorText>
													{field.state.meta.errors[0]}
												</Field.ErrorText>
											</Field.Root>
										)}
									</form.Field>
								)}

								{canSetAtivo && mode !== "view" && (
									<form.Field name="ativo">
										{(field) => (
											<Field.Root>
												<HStack justify="space-between">
													<Field.Label mb={0}>Ativo</Field.Label>
													<input
														type="checkbox"
														checked={field.state.value}
														onChange={(e) =>
															field.handleChange(e.target.checked)
														}
													/>
												</HStack>
											</Field.Root>
										)}
									</form.Field>
								)}

								{mode === "view" && user && (
									<Text fontSize="sm" color="fg.muted">
										Status: {user.ativo ? "Ativo" : "Inativo"}
									</Text>
								)}
							</Stack>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">
									{readOnly ? "Fechar" : "Cancelar"}
								</Button>
							</Dialog.ActionTrigger>
							{!readOnly && (
								<Button
									type="submit"
									bg="helios.solid"
									color="helios.contrast"
									loading={saving}
								>
									Salvar
								</Button>
							)}
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
