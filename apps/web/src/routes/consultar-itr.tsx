import {
	Button,
	Container,
	Heading,
	HStack,
	IconButton,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuDownload } from "react-icons/lu";

import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { maskCpfInput, parseCpfDigits } from "@/lib/cpf";
import {
	ITR_FILE_KIND_LABELS,
	itrApi,
	type PublicItrConsultItem,
} from "@/lib/itr-api";

import type { Route } from "./+types/consultar-itr";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Consultar ITR — Helios Labs" },
		{
			name: "description",
			content: "Consulte o status do seu ITR pelo CPF no Helios Labs.",
		},
	];
}

export default function ConsultarItrPage() {
	const [cpf, setCpf] = useState("");
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<PublicItrConsultItem[] | null>(null);
	const [lastCpf, setLastCpf] = useState("");

	async function handleConsult() {
		const digits = parseCpfDigits(cpf);
		if (digits.length !== 11) {
			toaster.create({ title: "Informe um CPF válido", type: "error" });
			return;
		}
		setLoading(true);
		try {
			const result = await itrApi.publicConsult(digits);
			setItems(result.items);
			setLastCpf(digits);
			if (result.items.length === 0) {
				toaster.create({
					title: "Nenhum processo encontrado para este CPF",
					type: "info",
				});
			}
		} catch (error) {
			toaster.create({
				title: error instanceof ApiError ? error.message : "Erro na consulta",
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	}

	async function handleDownload(fileId: string, name: string) {
		try {
			const { blob, filename } = await itrApi.publicDownload(fileId, lastCpf);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename || name;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Erro ao baixar arquivo",
				type: "error",
			});
		}
	}

	return (
		<Container maxW="md" py={{ base: 12, md: 16 }} px={5}>
			<Stack gap={6}>
				<Stack gap={2} textAlign="center">
					<Heading as="h1" size="2xl" letterSpacing="-0.02em">
						Consultar ITR
					</Heading>
					<Text color="fg.muted">
						Informe o CPF para ver o status e baixar os arquivos liberados.
					</Text>
				</Stack>

				<Stack gap={3}>
					<Input
						placeholder="000.000.000-00"
						inputMode="numeric"
						value={cpf}
						onChange={(e) => setCpf(maskCpfInput(e.target.value))}
						onKeyDown={(e) => {
							if (e.key === "Enter") void handleConsult();
						}}
					/>
					<Button
						bg="helios.solid"
						color="helios.contrast"
						loading={loading}
						onClick={() => void handleConsult()}
					>
						Consultar
					</Button>
				</Stack>

				{items && items.length > 0 && (
					<Stack gap={4}>
						{items.map((item) => (
							<Stack
								key={item.id}
								gap={2}
								borderWidth="1px"
								borderColor="helios.border"
								rounded="md"
								p={4}
							>
								<Text fontWeight="600">{item.clientName}</Text>
								<Text fontSize="sm" color="fg.muted">
									Status: {item.statusLabel}
								</Text>
								<Text>{item.message}</Text>
								{item.canDownload && item.files.length > 0 && (
									<Stack gap={2} pt={2}>
										{item.files.map((file) => (
											<HStack key={file.id} justify="space-between">
												<Text fontSize="sm" truncate maxW="70%">
													{ITR_FILE_KIND_LABELS[file.kind] ?? "Arquivo"}:{" "}
													{file.originalName}
												</Text>
												<IconButton
													size="sm"
													variant="ghost"
													aria-label="Baixar"
													onClick={() =>
														void handleDownload(file.id, file.originalName)
													}
												>
													<LuDownload />
												</IconButton>
											</HStack>
										))}
									</Stack>
								)}
							</Stack>
						))}
					</Stack>
				)}
			</Stack>
		</Container>
	);
}
