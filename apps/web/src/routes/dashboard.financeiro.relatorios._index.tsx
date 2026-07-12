import { Box, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

const REPORTS = [
	{
		slug: "geral",
		title: "Financeiro Geral",
		desc: "KPIs e resumo do período",
	},
	{
		slug: "fluxo-caixa",
		title: "Fluxo de Caixa",
		desc: "Realizado + previsto por dia",
	},
	{
		slug: "receitas-periodo",
		title: "Receitas por período",
		desc: "Títulos a receber no período",
	},
	{
		slug: "despesas-periodo",
		title: "Despesas por período",
		desc: "Títulos a pagar no período",
	},
	{
		slug: "receitas-cliente",
		title: "Receitas por Cliente",
		desc: "Agregado por cliente",
	},
	{
		slug: "despesas-categoria",
		title: "Despesas por Categoria",
		desc: "Agregado por categoria",
	},
	{
		slug: "centro-custo",
		title: "Centro de Custo",
		desc: "Receber vs pagar por centro",
	},
	{
		slug: "inadimplencia",
		title: "Inadimplência",
		desc: "Títulos vencidos e aging",
	},
	{
		slug: "clientes-devedores",
		title: "Clientes Devedores",
		desc: "Ranking de clientes em atraso",
	},
	{
		slug: "pagamentos-banco",
		title: "Pagamentos por Banco",
		desc: "Baixas a pagar por conta",
	},
	{
		slug: "recebimentos-banco",
		title: "Recebimentos por Banco",
		desc: "Baixas a receber por conta",
	},
	{
		slug: "extrato",
		title: "Extrato Financeiro",
		desc: "Movimentação e saldo por conta",
	},
] as const;

export default function DashboardFinanceiroRelatoriosIndex() {
	return (
		<Stack gap={6}>
			<Box>
				<Text fontSize="sm" color="fg.muted" fontWeight="600">
					Financeiro
				</Text>
				<Heading size="lg">Relatórios</Heading>
				<Text color="fg.muted" mt={1}>
					Escolha um relatório. Cada um permite filtrar período e baixar PDF.
				</Text>
			</Box>

			<Grid
				templateColumns={{
					base: "1fr",
					md: "repeat(2, 1fr)",
					xl: "repeat(3, 1fr)",
				}}
				gap={4}
			>
				{REPORTS.map((r) => (
					<Box
						key={r.slug}
						asChild
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border"
						borderRadius="2xl"
						p={5}
						_hover={{ borderColor: "helios.solid", bg: "bg.muted" }}
						transition="background 0.15s, border-color 0.15s"
					>
						<RouterLink to={`/dashboard/financeiro/relatorios/${r.slug}`}>
							<Heading size="sm" mb={1}>
								{r.title}
							</Heading>
							<Text fontSize="sm" color="fg.muted">
								{r.desc}
							</Text>
						</RouterLink>
					</Box>
				))}
			</Grid>
		</Stack>
	);
}
