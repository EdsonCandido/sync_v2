import { Box, Button, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { NavLink } from "react-router";

import { BrandMark } from "@/components/ui/BrandMark";
import { authClient } from "@/lib/auth-client";

import { useModuleAccess } from "./ModuleAccessProvider";
import { getVisibleModules } from "./modules";

const MotionBox = motion.create(Box);

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
		<Flex
			as="nav"
			direction="column"
			h="full"
			py={5}
			px={3}
			aria-label="Módulos"
		>
			<Box px={2} mb={8}>
				<BrandMark size="sm" to="/dashboard" showTagline />
			</Box>

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
									position="relative"
									fontWeight={isActive ? "semibold" : "medium"}
									color={isActive ? "helios.contrast" : "fg.muted"}
									bg={isActive ? "helios.solid" : "transparent"}
									shadow={isActive ? "solarGlowSoft" : undefined}
									_hover={{
										bg: isActive ? "helios.solid" : "bg.muted",
										color: isActive ? "helios.contrast" : "fg",
										filter: isActive ? "brightness(1.05)" : undefined,
									}}
									_focusVisible={{
										outline: "2px solid",
										outlineColor: "helios.focusRing",
										outlineOffset: "2px",
									}}
									transition="background 0.2s ease, color 0.2s ease, transform 0.15s ease"
									_active={{ transform: "scale(0.98)" }}
								>
									{isActive && (
										<MotionBox
											position="absolute"
											left={0}
											top="20%"
											bottom="20%"
											w="1"
											rounded="full"
											bg="helios.contrast"
											layoutId="sidebar-active"
										/>
									)}
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
				rounded="helios"
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
