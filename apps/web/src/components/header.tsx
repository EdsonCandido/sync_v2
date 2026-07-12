import { Box, Flex, HStack, Separator, Text } from "@chakra-ui/react";
import { NavLink } from "react-router";

import { ColorModeButton } from "./ui/color-mode";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Início" },
		{ to: "/contato", label: "Contato" },
	] as const;

	return (
		<Box>
			<Flex
				align="center"
				justify="space-between"
				px={{ base: 3, md: 4 }}
				py={2}
			>
				<HStack as="nav" gap={{ base: 3, md: 5 }} fontSize="md">
					<NavLink to="/" end>
						{() => (
							<Text
								fontWeight="800"
								letterSpacing="-0.03em"
								fontSize="lg"
								fontFamily="heading"
							>
								Sync
							</Text>
						)}
					</NavLink>
					{links.map(({ to, label }) => (
						<NavLink key={to} to={to} end={to === "/"}>
							{({ isActive }) => (
								<Text
									as="span"
									fontWeight={isActive ? "semibold" : "normal"}
									color="fg.muted"
								>
									{label}
								</Text>
							)}
						</NavLink>
					))}
				</HStack>
				<HStack gap={2}>
					<ColorModeButton />
					<UserMenu />
				</HStack>
			</Flex>
			<Separator />
		</Box>
	);
}
