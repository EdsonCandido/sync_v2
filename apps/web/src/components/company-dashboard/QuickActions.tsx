import { Box, Button, Heading, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import {
	LuBuilding2,
	LuChartColumn,
	LuClipboardList,
	LuSettings,
	LuUserPlus,
	LuUsers,
} from "react-icons/lu";
import { useNavigate } from "react-router";
import { toaster } from "@/components/ui/toaster";

const ACTIONS = [
	{
		id: "new-user",
		label: "Novo usuário",
		icon: LuUserPlus,
		path: null as string | null,
	},
	{
		id: "new-client",
		label: "Novo cliente",
		icon: LuUsers,
		path: "/dashboard/clientes",
	},
	{
		id: "new-request",
		label: "Nova solicitação",
		icon: LuClipboardList,
		path: null,
	},
	{
		id: "reports",
		label: "Relatórios",
		icon: LuChartColumn,
		path: null,
	},
	{
		id: "settings",
		label: "Configurações",
		icon: LuSettings,
		path: null,
	},
	{
		id: "my-company",
		label: "Minha empresa",
		icon: LuBuilding2,
		path: null,
	},
] as const;

export function QuickActions() {
	const navigate = useNavigate();

	function handleAction(path: string | null, label: string) {
		if (path) {
			navigate(path);
			return;
		}
		toaster.create({
			title: label,
			description: "Em breve.",
			type: "info",
		});
	}

	return (
		<Box>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Ações rápidas
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={5}>
				Atalhos para o dia a dia
			</Text>
			<SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
				{ACTIONS.map((action) => (
					<Button
						key={action.id}
						variant="outline"
						h="auto"
						py={5}
						px={4}
						flexDir="column"
						gap={2}
						borderRadius="heliosXl"
						borderColor="border"
						bg="helios.panel"
						shadow="heliosSm"
						_hover={{
							borderColor: "helios.border",
							bg: "helios.subtle",
							shadow: "solarGlowSoft",
						}}
						_focusVisible={{
							outline: "2px solid",
							outlineColor: "helios.focusRing",
							outlineOffset: "2px",
						}}
						onClick={() => handleAction(action.path, action.label)}
					>
						<Icon as={action.icon} boxSize={5} color="helios.fg" />
						<Text fontSize="sm" fontWeight="600" whiteSpace="normal">
							{action.label}
						</Text>
					</Button>
				))}
			</SimpleGrid>
		</Box>
	);
}
