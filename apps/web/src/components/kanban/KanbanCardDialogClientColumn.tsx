import {
	Box,
	Field,
	NativeSelect,
	Stack,
	Text,
	Textarea,
} from "@chakra-ui/react";

import type { KanbanCardClient } from "@/lib/kanban-api";

type FilterClient = { id: string; name: string };

type KanbanCardDialogClientColumnProps = {
	clientId: string;
	onClientIdChange: (value: string) => void;
	clients: FilterClient[];
	clientDetail: KanbanCardClient | null;
	description: string;
	onDescriptionChange: (value: string) => void;
	readOnly: boolean;
};

function formatAddress(client: KanbanCardClient) {
	const line1 = [client.street, client.number].filter(Boolean).join(", ");
	const line2 = [client.complement, client.district]
		.filter(Boolean)
		.join(" — ");
	const line3 = [client.city, client.state, client.zipCode]
		.filter(Boolean)
		.join(" / ");
	return [line1, line2, line3].filter(Boolean).join("\n");
}

export function KanbanCardDialogClientColumn({
	clientId,
	onClientIdChange,
	clients,
	clientDetail,
	description,
	onDescriptionChange,
	readOnly,
}: KanbanCardDialogClientColumnProps) {
	const selectedName =
		clients.find((c) => c.id === clientId)?.name ?? clientDetail?.name ?? null;

	return (
		<Stack
			gap={4}
			h="full"
			borderWidth="1px"
			borderColor="border"
			borderRadius="xl"
			bg="bg.subtle"
			p={4}
		>
			<Text fontWeight="700" fontSize="sm">
				Cliente
			</Text>

			<Field.Root>
				<Field.Label>Selecionar cliente</Field.Label>
				<NativeSelect.Root disabled={readOnly}>
					<NativeSelect.Field
						value={clientId}
						onChange={(e) => onClientIdChange(e.target.value)}
					>
						<option value="">Nenhum</option>
						{clients.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</NativeSelect.Field>
				</NativeSelect.Root>
			</Field.Root>

			{clientDetail && clientDetail.id === clientId ? (
				<Stack gap={3}>
					<DetailRow label="Nome" value={clientDetail.name} />
					{clientDetail.tradeName ? (
						<DetailRow label="Nome fantasia" value={clientDetail.tradeName} />
					) : null}
					<DetailRow label="Documento" value={clientDetail.document} />
					<DetailRow label="E-mail" value={clientDetail.email} />
					<DetailRow label="Telefone" value={clientDetail.phone} />
					<Box>
						<Text fontSize="xs" color="fg.muted" mb={1}>
							Endereço
						</Text>
						<Text fontSize="sm" whiteSpace="pre-line">
							{formatAddress(clientDetail)}
						</Text>
					</Box>
				</Stack>
			) : clientId && selectedName ? (
				<Text fontSize="sm" color="fg.muted">
					{selectedName}. Detalhes completos após salvar.
				</Text>
			) : (
				<Text fontSize="sm" color="fg.muted">
					Nenhum cliente vinculado.
				</Text>
			)}

			<Field.Root>
				<Field.Label>Observações</Field.Label>
				<Textarea
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					disabled={readOnly}
					rows={5}
					placeholder="Observações da tarefa"
					bg="bg.panel"
				/>
			</Field.Root>
		</Stack>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<Box>
			<Text fontSize="xs" color="fg.muted" mb={0.5}>
				{label}
			</Text>
			<Text fontSize="sm">{value || "—"}</Text>
		</Box>
	);
}
