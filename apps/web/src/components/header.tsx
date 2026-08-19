import { Box, Flex, HStack, Separator } from "@chakra-ui/react";
import { NavLink } from "react-router";

import { AppVersionLabel } from "./AppVersionLabel";
import { BrandMark } from "./ui/BrandMark";
import { ColorModeButton } from "./ui/color-mode";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Início", end: true },
		{ to: "/#recursos", label: "Recursos", end: false },
		{ to: "/contato", label: "Contato", end: false },
		{ to: "/login", label: "Entrar", end: false },
	] as const;

	return (
		<Box
			as="header"
			position="sticky"
			top={0}
			zIndex={20}
			bg="dash.navbar"
			backdropFilter="blur(14px)"
			borderBottomWidth="1px"
			borderColor="border"
		>
			<Flex
				align="center"
				justify="space-between"
				px={{ base: 4, md: 6 }}
				py={3}
				maxW="7xl"
				mx="auto"
				w="full"
			>
				<HStack as="nav" gap={{ base: 4, md: 6 }} fontSize="sm" flexWrap="wrap">
					<BrandMark size="sm" showTagline={false} />
					{links.map(({ to, label, end }) => (
						<NavLink key={to} to={to} end={end}>
							{({ isActive }) => (
								<Box
									as="span"
									fontWeight={isActive ? "semibold" : "medium"}
									color={isActive ? "helios.fg" : "fg.muted"}
									_hover={{ color: "helios.fg" }}
									transition="color 0.15s ease"
								>
									{label}
								</Box>
							)}
						</NavLink>
					))}
				</HStack>
				<HStack gap={2}>
					<AppVersionLabel />
					<ColorModeButton />
					<UserMenu />
				</HStack>
			</Flex>
			<Separator display="none" />
		</Box>
	);
}
