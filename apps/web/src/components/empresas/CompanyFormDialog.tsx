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

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import {
	type Company,
	type CompanyInput,
	cepApi,
	geocodeApi,
	type Plan,
} from "@/lib/companies-api";

import { CompanyMap } from "./CompanyMap";

const companyFormSchema = z.object({
	corporateName: z.string().min(1, "Obrigatório"),
	tradeName: z.string().min(1, "Obrigatório"),
	document: z.string().min(14, "CNPJ inválido"),
	email: z.email("E-mail inválido"),
	phone: z.string().min(1, "Obrigatório"),
	website: z.string().optional(),
	zipCode: z.string().min(8, "CEP inválido"),
	street: z.string().min(1, "Obrigatório"),
	number: z.string().min(1, "Obrigatório"),
	complement: z.string().optional(),
	district: z.string().min(1, "Obrigatório"),
	city: z.string().min(1, "Obrigatório"),
	state: z.string().min(2, "UF obrigatória").max(2),
	planId: z.string().uuid("Selecione um plano"),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type CompanyFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit" | "view";
	company?: Company | null;
	plans: Plan[];
	onSubmit: (values: CompanyInput) => Promise<void>;
};

const emptyValues: CompanyFormValues = {
	corporateName: "",
	tradeName: "",
	document: "",
	email: "",
	phone: "",
	website: "",
	zipCode: "",
	street: "",
	number: "",
	complement: "",
	district: "",
	city: "",
	state: "",
	planId: "",
	latitude: null,
	longitude: null,
};

export function CompanyFormDialog({
	open,
	onOpenChange,
	mode,
	company,
	plans,
	onSubmit,
}: CompanyFormDialogProps) {
	const readOnly = mode === "view";
	const [geoLoading, setGeoLoading] = useState(false);
	const lastGeocodeKey = useRef("");

	const form = useForm({
		defaultValues: emptyValues,
		onSubmit: async ({ value }) => {
			if (readOnly) return;
			await onSubmit({
				corporateName: value.corporateName,
				tradeName: value.tradeName,
				document: value.document,
				email: value.email,
				phone: value.phone,
				website: value.website || null,
				zipCode: value.zipCode.replace(/\D/g, ""),
				street: value.street,
				number: value.number,
				complement: value.complement || null,
				district: value.district,
				city: value.city,
				state: value.state.toUpperCase(),
				planId: value.planId,
				latitude: value.latitude ?? null,
				longitude: value.longitude ?? null,
			});
		},
		validators: {
			onSubmit: companyFormSchema,
		},
	});

	useEffect(() => {
		if (!open) return;
		if (company) {
			form.reset({
				corporateName: company.corporateName,
				tradeName: company.tradeName,
				document: company.document,
				email: company.email,
				phone: company.phone,
				website: company.website ?? "",
				zipCode: company.zipCode,
				street: company.street,
				number: company.number,
				complement: company.complement ?? "",
				district: company.district,
				city: company.city,
				state: company.state,
				planId: company.planId,
				latitude: company.latitude,
				longitude: company.longitude,
			});
		} else {
			form.reset({
				...emptyValues,
				planId: plans[0]?.id ?? "",
			});
		}
		lastGeocodeKey.current = "";
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, company, plans]);

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

	async function maybeGeocode(values: CompanyFormValues) {
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
			? "Nova empresa"
			: mode === "edit"
				? "Editar empresa"
				: "Visualizar empresa";

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
							id="company-form"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<Stack gap={4}>
								<Text fontSize="sm" color="fg.muted" fontWeight="600">
									Empresa
								</Text>
								<form.Field name="corporateName">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>Razão Social</Field.Label>
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
												<Field.Label>CNPJ</Field.Label>
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
								<form.Field name="website">
									{(field) => (
										<Field.Root>
											<Field.Label>Site</Field.Label>
											<Input
												value={field.state.value}
												disabled={readOnly}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
											/>
										</Field.Root>
									)}
								</form.Field>
								<form.Field name="planId">
									{(field) => (
										<Field.Root
											invalid={field.state.meta.errors.length > 0}
											required
										>
											<Field.Label>Plano</Field.Label>
											<NativeSelect.Root disabled={readOnly}>
												<NativeSelect.Field
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
												>
													<option value="">Selecione…</option>
													{plans.map((plan) => (
														<option key={plan.id} value={plan.id}>
															{plan.name}
														</option>
													))}
												</NativeSelect.Field>
											</NativeSelect.Root>
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
													label={form.state.values.tradeName || "Empresa"}
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
										form="company-form"
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
