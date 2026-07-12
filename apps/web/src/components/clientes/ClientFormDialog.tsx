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
import { useEffect, useRef, useState } from "react";
import z from "zod";

import { CompanyMap } from "@/components/empresas/CompanyMap";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type Client,
	type ClientInput,
	cepApi,
	geocodeApi,
} from "@/lib/clients-api";

const clientFormSchema = z
	.object({
		personType: z.enum(["PF", "PJ"]),
		document: z
			.string()
			.min(1, "Obrigatório")
			.regex(/^[A-Za-z0-9]+$/, "Somente letras e números"),
		name: z.string().min(1, "Obrigatório"),
		tradeName: z.string().optional(),
		email: z.email("E-mail inválido"),
		phone: z.string().min(1, "Obrigatório"),
		zipCode: z.string().min(8, "CEP inválido"),
		street: z.string().min(1, "Obrigatório"),
		number: z.string().min(1, "Obrigatório"),
		complement: z.string().optional(),
		district: z.string().min(1, "Obrigatório"),
		city: z.string().min(1, "Obrigatório"),
		state: z.string().min(2, "UF obrigatória").max(2),
		latitude: z.number().nullable().optional(),
		longitude: z.number().nullable().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.personType === "PJ" && !data.tradeName?.trim()) {
			ctx.addIssue({
				code: "custom",
				message: "Nome fantasia obrigatório para PJ",
				path: ["tradeName"],
			});
		}
	});

type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit" | "view";
	client?: Client | null;
	onSubmit: (values: ClientInput) => Promise<void>;
};

const emptyValues: ClientFormValues = {
	personType: "PF",
	document: "",
	name: "",
	tradeName: "",
	email: "",
	phone: "",
	zipCode: "",
	street: "",
	number: "",
	complement: "",
	district: "",
	city: "",
	state: "",
	latitude: null,
	longitude: null,
};

export function ClientFormDialog({
	open,
	onOpenChange,
	mode,
	client,
	onSubmit,
}: ClientFormDialogProps) {
	const readOnly = mode === "view";
	const [geoLoading, setGeoLoading] = useState(false);
	const lastGeocodeKey = useRef("");

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			if (readOnly) return;
			await onSubmit({
				personType: value.personType,
				document: value.document.replace(/[^A-Za-z0-9]/g, ""),
				name: value.name,
				tradeName:
					value.personType === "PJ"
						? value.tradeName?.trim() || null
						: value.tradeName?.trim() || null,
				email: value.email,
				phone: value.phone,
				zipCode: value.zipCode.replace(/\D/g, ""),
				street: value.street,
				number: value.number,
				complement: value.complement || null,
				district: value.district,
				city: value.city,
				state: value.state.toUpperCase(),
				latitude: value.latitude ?? null,
				longitude: value.longitude ?? null,
			});
		},
		validators: {
			onSubmit: clientFormSchema,
		},
	});

	useEffect(() => {
		if (!open) return;
		if (client) {
			form.reset({
				personType: client.personType,
				document: client.document,
				name: client.name,
				tradeName: client.tradeName ?? "",
				email: client.email,
				phone: client.phone,
				zipCode: client.zipCode,
				street: client.street,
				number: client.number,
				complement: client.complement ?? "",
				district: client.district,
				city: client.city,
				state: client.state,
				latitude: client.latitude,
				longitude: client.longitude,
			});
		} else {
			form.reset(emptyValues);
		}
		lastGeocodeKey.current = "";
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, client]);

	async function handleCepBlur(cep: string) {
		if (readOnly) return;
		const digits = cep.replace(/\D/g, "");
		if (digits.length !== 8) return;
		try {
			const result = await cepApi.lookup(digits);
			form.setFieldValue("zipCode", result.zipCode);
			form.setFieldValue("street", result.street);
			form.setFieldValue("district", result.district);
			form.setFieldValue("city", result.city);
			form.setFieldValue("state", result.state);
			toaster.create({
				title: "Endereço preenchido pelo CEP",
				type: "success",
			});
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro ao buscar CEP",
				type: "error",
			});
		}
	}

	async function maybeGeocode(values: ClientFormValues) {
		if (readOnly) return;
		const { street, number, district, city, state, zipCode } = values;
		if (!street || !number || !district || !city || !state || !zipCode) return;

		const key = [street, number, district, city, state, zipCode].join("|");
		if (key === lastGeocodeKey.current) return;
		lastGeocodeKey.current = key;

		setGeoLoading(true);
		try {
			const result = await geocodeApi.lookup({
				street,
				number,
				district,
				city,
				state,
				zipCode: zipCode.replace(/\D/g, ""),
			});
			form.setFieldValue("latitude", result.latitude);
			form.setFieldValue("longitude", result.longitude);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError
						? error.message
						: "Erro ao obter coordenadas",
				type: "error",
			});
		} finally {
			setGeoLoading(false);
		}
	}

	const title =
		mode === "create"
			? "Novo cliente"
			: mode === "edit"
				? "Editar cliente"
				: "Visualizar cliente";

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
			size="xl"
			scrollBehavior="inside"
		>
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.panel" maxH="90vh">
					<Dialog.Header>
						<Dialog.Title>{title}</Dialog.Title>
						<Dialog.CloseTrigger />
					</Dialog.Header>
					<Dialog.Body>
						<form
							id="client-form"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<Stack gap={4}>
								<Text fontSize="sm" color="fg.muted" fontWeight="600">
									Dados
								</Text>
								<form.Field name="personType">
									{(field) => (
										<Field.Root required>
											<Field.Label>Tipo</Field.Label>
											<NativeSelect.Root disabled={readOnly}>
												<NativeSelect.Field
													value={field.state.value}
													onChange={(e) =>
														field.handleChange(e.target.value as "PF" | "PJ")
													}
													onBlur={field.handleBlur}
												>
													<option value="PF">Pessoa Física</option>
													<option value="PJ">Pessoa Jurídica</option>
												</NativeSelect.Field>
											</NativeSelect.Root>
										</Field.Root>
									)}
								</form.Field>

								<form.Subscribe selector={(s) => s.values.personType}>
									{(personType) => (
										<>
											<form.Field name="name">
												{(field) => (
													<Field.Root
														invalid={field.state.meta.errors.length > 0}
														required
													>
														<Field.Label>
															{personType === "PJ"
																? "Razão Social"
																: "Nome completo"}
														</Field.Label>
														<Input
															value={field.state.value}
															disabled={readOnly}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
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
											{personType === "PJ" && (
												<form.Field name="tradeName">
													{(field) => (
														<Field.Root
															invalid={field.state.meta.errors.length > 0}
															required
														>
															<Field.Label>Nome Fantasia</Field.Label>
															<Input
																value={field.state.value}
																disabled={readOnly}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
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
											)}
										</>
									)}
								</form.Subscribe>

								<HStack
									align="start"
									gap={4}
									flexDir={{ base: "column", md: "row" }}
								>
									<form.Field name="document">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<form.Subscribe selector={(s) => s.values.personType}>
													{(personType) => (
														<Field.Label>
															{personType === "PJ" ? "CNPJ" : "CPF"}
														</Field.Label>
													)}
												</form.Subscribe>
												<Input
													value={field.state.value}
													disabled={readOnly}
													placeholder="Somente letras e números"
													onChange={(e) =>
														field.handleChange(
															e.target.value.replace(/[^A-Za-z0-9]/g, ""),
														)
													}
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
									<form.Field name="phone">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<Field.Label>Telefone</Field.Label>
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
								</HStack>

								<form.Field name="email">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>Email</Field.Label>
											<Input
												type="email"
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

								<Text fontSize="sm" color="fg.muted" fontWeight="600" mt={2}>
									Endereço
								</Text>
								<form.Field name="zipCode">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>CEP</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={() => {
													field.handleBlur();
													void handleCepBlur(field.state.value);
												}}
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
								<form.Field name="street">
									{(field) => (
										<Field.Root>
											<Field.Label>Logradouro</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={() => {
													field.handleBlur();
													void maybeGeocode(form.state.values);
												}}
											/>
										</Field.Root>
									)}
								</form.Field>
								<HStack
									align="start"
									gap={4}
									flexDir={{ base: "column", md: "row" }}
								>
									<form.Field name="number">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<Field.Label>Número</Field.Label>
												<Input
													value={field.state.value}
													disabled={readOnly}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={() => {
														field.handleBlur();
														void maybeGeocode(form.state.values);
													}}
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
									<form.Field name="complement">
										{(field) => (
											<Field.Root flex="1">
												<Field.Label>Complemento</Field.Label>
												<Input
													value={field.state.value}
													disabled={readOnly}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
												/>
											</Field.Root>
										)}
									</form.Field>
								</HStack>
								<form.Field name="district">
									{(field) => (
										<Field.Root>
											<Field.Label>Bairro</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={() => {
													field.handleBlur();
													void maybeGeocode(form.state.values);
												}}
											/>
										</Field.Root>
									)}
								</form.Field>
								<HStack
									align="start"
									gap={4}
									flexDir={{ base: "column", md: "row" }}
								>
									<form.Field name="city">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												flex="1"
											>
												<Field.Label>Cidade</Field.Label>
												<Input
													value={field.state.value}
													disabled={readOnly}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={() => {
														field.handleBlur();
														void maybeGeocode(form.state.values);
													}}
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
									<form.Field name="state">
										{(field) => (
											<Field.Root
												invalid={field.state.meta.errors.length > 0}
												required
												w={{ base: "full", md: "100px" }}
											>
												<Field.Label>Estado</Field.Label>
												<Input
													value={field.state.value}
													disabled={readOnly}
													maxLength={2}
													onChange={(e) =>
														field.handleChange(e.target.value.toUpperCase())
													}
													onBlur={() => {
														field.handleBlur();
														void maybeGeocode(form.state.values);
													}}
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

								<form.Subscribe
									selector={(s) =>
										[s.values.latitude, s.values.longitude] as const
									}
								>
									{([latitude, longitude]) =>
										latitude != null && longitude != null ? (
											<Stack gap={2}>
												<Text fontSize="sm" color="fg.muted">
													{geoLoading
														? "Atualizando mapa…"
														: "Localização no mapa"}
												</Text>
												<CompanyMap
													latitude={latitude}
													longitude={longitude}
													label={
														form.state.values.tradeName ||
														form.state.values.name ||
														"Cliente"
													}
												/>
											</Stack>
										) : (
											<Text fontSize="sm" color="fg.muted">
												{geoLoading
													? "Buscando coordenadas…"
													: "Preencha o endereço para exibir o mapa."}
											</Text>
										)
									}
								</form.Subscribe>
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
										form="client-form"
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
