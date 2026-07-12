import { Box, HStack, Text } from "@chakra-ui/react";
import { NavLink, Outlet } from "react-router";

import { ModuleGate } from "@/components/dashboard/ModuleGate";

const LINKS = [
	{ to: "/dashboard/financeiro", label: "Dashboard", end: true },
	{ to: "/dashboard/financeiro/contas-a-receber", label: "A receber" },
	{ to: "/dashboard/financeiro/contas-a-pagar", label: "A pagar" },
	{ to: "/dashboard/financeiro/categorias", label: "Categorias" },
	{ to: "/dashboard/financeiro/centros-de-custo", label: "Centros" },
	{ to: "/dashboard/financeiro/bancos", label: "Bancos" },
	{ to: "/dashboard/financeiro/fornecedores", label: "Fornecedores" },
	{ to: "/dashboard/financeiro/relatorios", label: "Relatórios" },
];

export default function DashboardFinanceiroLayout() {
	return (
		<ModuleGate moduleKey="financeiro">
			<Box>
				<HStack
					gap={1}
					mb={6}
					flexWrap="wrap"
					borderBottomWidth="1px"
					borderColor="border"
					pb={2}
				>
					{LINKS.map((link) => (
						<NavLink key={link.to} to={link.to} end={link.end}>
							{({ isActive }) => (
								<Text
									as="span"
									px={3}
									py={2}
									fontSize="sm"
									fontWeight={isActive ? "700" : "500"}
									color={isActive ? "helios.fg" : "fg.muted"}
									borderBottomWidth="2px"
									borderColor={isActive ? "helios.solid" : "transparent"}
									_hover={{ color: "fg" }}
								>
									{link.label}
								</Text>
							)}
						</NavLink>
					))}
				</HStack>
				<Outlet />
			</Box>
		</ModuleGate>
	);
}
