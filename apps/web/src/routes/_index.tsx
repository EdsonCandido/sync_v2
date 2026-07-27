import {
	Box,
	Button,
	Container,
	Flex,
	Heading,
	Stack,
	Text,
} from "@chakra-ui/react";
import { Link } from "react-router";

import type { Route } from "./+types/_index";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Sync — sincronize com clareza" },
		{
			name: "description",
			content:
				"Centralize operações, alinhe equipes e acompanhe o que importa em um só lugar.",
		},
	];
}

export default function Home() {
	return (
		<Box
			as="main"
			minH="100%"
			position="relative"
			overflow="hidden"
			bgGradient="to-br"
			gradientFrom="bg"
			gradientVia="bg.subtle"
			gradientTo="bg"
		>
			<Box
				position="absolute"
				top="-20%"
				right="-10%"
				w={{ base: "70vw", md: "50vw" }}
				h={{ base: "70vw", md: "50vw" }}
				borderRadius="full"
				bg="teal.muted"
				opacity={0.45}
				filter="blur(40px)"
				pointerEvents="none"
				animation="pulse 8s ease-in-out infinite"
			/>
			<Box
				position="absolute"
				bottom="-15%"
				left="-5%"
				w={{ base: "50vw", md: "35vw" }}
				h={{ base: "50vw", md: "35vw" }}
				borderRadius="full"
				bg="cyan.muted"
				opacity={0.3}
				filter="blur(48px)"
				pointerEvents="none"
			/>

			<Container
				maxW="5xl"
				px={{ base: 5, md: 8 }}
				py={{ base: 16, md: 24 }}
				position="relative"
			>
				<Stack gap={{ base: 8, md: 10 }} maxW="2xl">
					<Text
						as="span"
						fontSize={{ base: "4xl", md: "6xl" }}
						fontWeight="800"
						letterSpacing="-0.04em"
						lineHeight="1"
						color="fg"
					>
						Sync
					</Text>

					<Heading
						as="h1"
						fontSize={{ base: "2xl", md: "3xl" }}
						fontWeight="600"
						letterSpacing="-0.02em"
						lineHeight="1.2"
						color="fg.muted"
					>
						Operações alinhadas. Decisões no ritmo certo.
					</Heading>

					<Text
						fontSize={{ base: "md", md: "lg" }}
						color="fg.muted"
						maxW="xl"
						lineHeight="1.6"
					>
						Uma plataforma simples para sincronizar equipes, clientes e
						processos — com clareza do primeiro acesso.
					</Text>

					<Flex gap={3} direction={{ base: "column", sm: "row" }} pt={2}>
						<Button asChild size="lg" colorPalette="teal" px={8}>
							<Link to="/login">Entrar</Link>
						</Button>
						<Button asChild size="lg" variant="outline" colorPalette="gray">
							<Link to="/consultar-itr">Consultar ITR</Link>
						</Button>
						<Button asChild size="lg" variant="outline" colorPalette="gray">
							<Link to="/contato">Falar conosco</Link>
						</Button>
					</Flex>
				</Stack>
			</Container>
		</Box>
	);
}
