import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import { authClient } from "@/lib/auth-client";

import { useModuleAccess } from "./ModuleAccessProvider";
import { getVisibleModules } from "./modules";

type DashboardSidebarProps = {
	onNavigate?: () => void;
};

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
	const { data: session } = authClient.useSession();
	const perfil = (session?.user as { perfil?: string } | undefined)?.perfil;
	const { canRead, loading } = useModuleAccess();
	const modules = loading
		? []
		: getVisibleModules({ perfil, canReadModule: canRead });

	return (
		<Flex as="nav" direction="column" h="full" py={5} px={3}>
			<Flex align="center" gap={3} px={3} mb={8}>
				<Box
					w="9"
					h="9"
					rounded="md"
					bgGradient="to-br"
					gradientFrom="helios.400"
					gradientVia="helios.300"
					gradientTo="helios.200"
					boxShadow="0 0 24px rgba(250, 204, 21, 0.35)"
					flexShrink={0}
				/>
				<Box>
					<Text
						fontFamily="heading"
						fontWeight="800"
						fontSize="lg"
						letterSpacing="-0.03em"
						lineHeight="1.1"
						color="fg"
					>
						Sync
					</Text>
					<Text
						fontSize="xs"
						color="helios.fg"
						fontWeight="500"
						letterSpacing="0.04em"
					>
						HELIOS
					</Text>
				</Box>
			</Flex>

			<Text
				px={3}
				mb={2}
				fontSize="xs"
				fontWeight="600"
				color="fg.muted"
				textTransform="uppercase"
				letterSpacing="0.08em"
			>
				Módulos
			</Text>

			<Stack gap={1} flex="1">
				{modules.map((mod) => {
					const IconComp = mod.icon;
					return (
						<NavLink
							key={mod.id}
							to={mod.path}
							end={mod.end}
							onClick={onNavigate}
						>
							{({ isActive }) => (
								<Button
									variant="ghost"
									justifyContent="flex-start"
									w="full"
									size="sm"
									h="10"
									px={3}
									fontWeight={isActive ? "semibold" : "medium"}
									color={isActive ? "helios.contrast" : "fg.muted"}
									bg={isActive ? "helios.solid" : "transparent"}
									_hover={{
										bg: isActive ? "helios.solid" : "bg.muted",
										color: isActive ? "helios.contrast" : "fg",
										filter: isActive ? "brightness(1.05)" : undefined,
									}}
									transition="background 0.2s ease, color 0.2s ease, transform 0.15s ease"
									_active={{ transform: "scale(0.98)" }}
								>
									<Icon as={IconComp} boxSize={4} />
									{mod.label}
								</Button>
							)}
						</NavLink>
					);
				})}
			</Stack>

			<Box
				mt={4}
				mx={1}
				px={3}
				py={3}
				rounded="md"
				borderWidth="1px"
				borderColor="helios.border"
				bg="helios.subtle"
			>
				<Text fontSize="xs" color="fg.muted" lineHeight="tall">
					Tecnologia que ilumina resultados.
				</Text>
			</Box>
		</Flex>
	);
}
