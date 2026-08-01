import { Box, Heading, Table, Text } from "@chakra-ui/react";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

type RecentActivityTableProps = {
	activities: CompanyDashboard["recentActivities"];
};

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
			shadow="heliosSm"
		>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Últimas atividades
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={5}>
				Eventos mais recentes da empresa
			</Text>

			{activities.length === 0 ? (
				<Text color="fg.muted" py={10} textAlign="center">
					Nenhuma atividade registrada.
				</Text>
			) : (
				<Box overflowX="auto">
					<Table.Root size="sm" variant="line">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>Usuário</Table.ColumnHeader>
								<Table.ColumnHeader>Ação</Table.ColumnHeader>
								<Table.ColumnHeader>Data</Table.ColumnHeader>
								<Table.ColumnHeader>Hora</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{activities.map((item) => {
								const at = new Date(item.occurredAt);
								return (
									<Table.Row key={item.id}>
										<Table.Cell fontWeight="600">{item.userName}</Table.Cell>
										<Table.Cell color="fg.muted">{item.action}</Table.Cell>
										<Table.Cell>{at.toLocaleDateString("pt-BR")}</Table.Cell>
										<Table.Cell>
											{at.toLocaleTimeString("pt-BR", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					</Table.Root>
				</Box>
			)}
		</Box>
	);
}
