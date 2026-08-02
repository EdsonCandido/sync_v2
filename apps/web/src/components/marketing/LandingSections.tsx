import {
	Accordion,
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	Icon,
	Image,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
	LuArrowRight,
	LuChartColumn,
	LuCheck,
	LuShield,
	LuSparkles,
	LuZap,
} from "react-icons/lu";
import { Link } from "react-router";

import telaAdminPng from "@/assets/images/tela_admin.png";
import telaAdminWebp from "@/assets/images/tela_admin.webp";
import { BrandMark } from "@/components/ui/BrandMark";
import { HeliosCard } from "@/components/ui/HeliosCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SolarGlow } from "@/components/ui/SolarGlow";

const MotionBox = motion.create(Box);

const BENEFITS = [
	{
		icon: LuZap,
		title: "Velocidade operacional",
		body: "Fluxos claros para decidir rápido sem perder precisão.",
	},
	{
		icon: LuChartColumn,
		title: "Visão em tempo quase real",
		body: "KPIs, tendências e alertas no mesmo panorama.",
	},
	{
		icon: LuShield,
		title: "Controle com confiança",
		body: "Permissões, auditoria e soft-delete nativos do produto.",
	},
	{
		icon: LuSparkles,
		title: "Inteligência aplicada",
		body: "Insights e atalhos que reduzem carga cognitiva.",
	},
] as const;

const FEATURES = [
	{
		title: "Kanban inteligente",
		body: "Boards, cards e prazos com foco em execução.",
		span: { base: 1, md: 2 },
	},
	{
		title: "Financeiro premium",
		body: "Contas, projeções e relatórios com clareza.",
		span: { base: 1, md: 1 },
	},
	{
		title: "Clientes & empresas",
		body: "Cadastros organizados, módulos por plano.",
		span: { base: 1, md: 1 },
	},
	{
		title: "Automação & vendas",
		body: "Fluxos e pipeline no mesmo ritmo do time.",
		span: { base: 1, md: 2 },
	},
] as const;

const STEPS = [
	{ title: "Entre", body: "Acesse com segurança e perfil certo." },
	{ title: "Organize", body: "Módulos, equipes e processos no lugar." },
	{ title: "Ilumine", body: "Dados e ações no ritmo do negócio." },
] as const;

const FAQ = [
	{
		q: "O que é o Dashboard?",
		a: "O painel central do Helios: KPIs, tendências, alertas e atalhos num só panorama — visão operacional em tempo quase real.",
	},
	{
		q: "Como funciona o módulo de Clientes?",
		a: "Cadastro de pessoas e empresas, histórico e organização por plano. Tudo conectado aos demais módulos do CRM.",
	},
	{
		q: "O que o Financeiro cobre?",
		a: "Contas a pagar e receber, categorias, centros de custo, bancos e visão clara de caixa — com relatórios quando precisar aprofundar.",
	},
	{
		q: "Para que serve a Agenda?",
		a: "Compromissos, prazos e follow-ups alinhados à operação — para o time não perder ritmo nem contexto.",
	},
	{
		q: "Como o módulo de Vendas ajuda?",
		a: "Pipeline e execução comercial no mesmo ecossistema: acompanhe oportunidades sem saltar entre ferramentas.",
	},
	{
		q: "O que a Automação faz?",
		a: "Fluxos e regras que reduzem trabalho repetitivo — sincronizando etapas entre módulos sem atrito manual.",
	},
	{
		q: "O que encontro em Relatórios?",
		a: "Leituras objetivas dos dados do CRM — cortes e insights para decidir com precisão, sem planilha paralela.",
	},
	{
		q: "O módulo de Configurações controla o quê?",
		a: "Preferências da empresa, permissões, identidade e ajustes da plataforma — o controle fino do Helios.",
	},
] as const;

export function LandingHero() {
	return (
		<Box
			as="section"
			position="relative"
			overflow="hidden"
			minH={{ base: "88svh", md: "92svh" }}
			display="flex"
			alignItems="center"
		>
			<SolarGlow intensity="strong" />
			<Container
				maxW="7xl"
				px={{ base: 5, md: 8 }}
				py={{ base: 16, md: 20 }}
				position="relative"
				zIndex={1}
			>
				<Grid
					templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }}
					gap={{ base: 12, lg: 10 }}
					alignItems="center"
				>
					<Stack gap={6} maxW="xl">
						<SectionLabel>Helios Labs</SectionLabel>
						<Heading
							as="h1"
							fontSize={{ base: "4xl", md: "6xl" }}
							fontWeight="800"
							letterSpacing="-0.04em"
							lineHeight="0.95"
							color="fg"
						>
							CRM alimentado pela energia do Sol.
						</Heading>
						<Text
							fontSize={{ base: "md", md: "lg" }}
							color="fg.muted"
							maxW="lg"
						>
							Inteligência, precisão e velocidade para operações que não aceitam
							interface genérica.
						</Text>
						<Flex gap={3} direction={{ base: "column", sm: "row" }} pt={2}>
							<Button asChild size="lg" colorPalette="helios" px={8}>
								<Link to="/login">
									Entrar
									<LuArrowRight />
								</Link>
							</Button>
							<Button asChild size="lg" variant="subtle">
							<Link to="/contato">Falar conosco</Link>
						</Button>
						</Flex>
					</Stack>

					<MotionBox
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						display="flex"
						alignItems="center"
						justifyContent="center"
						minH={{ base: "280px", md: "420px" }}
						aria-hidden
					>
						<Box
							position="relative"
							w={{ base: "260px", md: "380px" }}
							h={{ base: "260px", md: "380px" }}
						>
							{/* Órbitas */}
							{[0.55, 0.75, 1].map((scale, i) => (
								<MotionBox
									key={scale}
									position="absolute"
									inset={0}
									m="auto"
									w={`${scale * 100}%`}
									h={`${scale * 100}%`}
									borderRadius="full"
									borderWidth="1px"
									borderColor="helios.border"
									opacity={0.35 - i * 0.06}
									animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
									transition={{
										duration: 28 + i * 14,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
								>
									{/* satélite na órbita */}
									<Box
										position="absolute"
										top="0"
										left="50%"
										transform="translate(-50%, -50%)"
										w={{ base: "2.5", md: "3" }}
										h={{ base: "2.5", md: "3" }}
										rounded="full"
										bg="helios.solid"
										shadow="solarGlowSoft"
									/>
								</MotionBox>
							))}

							{/* Núcleo solar */}
							<MotionBox
								position="absolute"
								top="50%"
								left="50%"
								w={{ base: "72px", md: "108px" }}
								h={{ base: "72px", md: "108px" }}
								ml={{ base: "-36px", md: "-54px" }}
								mt={{ base: "-36px", md: "-54px" }}
								borderRadius="full"
								bgGradient="to-br"
								gradientFrom="helios.200"
								gradientVia="helios.400"
								gradientTo="helios.600"
								shadow="solarGlow"
								animate={{
									scale: [1, 1.06, 1],
									boxShadow: [
										"0 0 32px rgba(253, 184, 19, 0.35)",
										"0 0 56px rgba(253, 184, 19, 0.55)",
										"0 0 32px rgba(253, 184, 19, 0.35)",
									],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>

							{/* Halo externo pulsante */}
							<MotionBox
								position="absolute"
								top="50%"
								left="50%"
								w={{ base: "120px", md: "168px" }}
								h={{ base: "120px", md: "168px" }}
								ml={{ base: "-60px", md: "-84px" }}
								mt={{ base: "-60px", md: "-84px" }}
								borderRadius="full"
								borderWidth="1px"
								borderColor="helios.solid"
								opacity={0.25}
								animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.08, 0.25] }}
								transition={{
									duration: 5,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>

							{/* Partículas de luz */}
							{[0, 60, 120, 180, 240, 300].map((deg, i) => (
								<MotionBox
									key={deg}
									position="absolute"
									top="50%"
									left="50%"
									w="1.5"
									h="1.5"
									rounded="full"
									bg="helios.200"
									style={{
										transformOrigin: "0 0",
									}}
									animate={{
										x: [
											Math.cos((deg * Math.PI) / 180) * 90,
											Math.cos(((deg + 40) * Math.PI) / 180) * 130,
											Math.cos((deg * Math.PI) / 180) * 90,
										],
										y: [
											Math.sin((deg * Math.PI) / 180) * 90,
											Math.sin(((deg + 40) * Math.PI) / 180) * 130,
											Math.sin((deg * Math.PI) / 180) * 90,
										],
										opacity: [0.2, 0.9, 0.2],
										scale: [0.8, 1.4, 0.8],
									}}
									transition={{
										duration: 6 + i * 0.4,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
										delay: i * 0.2,
									}}
								/>
							))}
						</Box>
					</MotionBox>
				</Grid>
			</Container>
		</Box>
	);
}

export function LandingBenefits() {
	return (
		<Box as="section" py={{ base: 16, md: 24 }} id="beneficios">
			<Container maxW="7xl" px={{ base: 5, md: 8 }}>
				<Stack gap={3} mb={10} maxW="2xl">
					<SectionLabel>Benefícios</SectionLabel>
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
					>
						Menos atrito. Mais luz nos dados.
					</Heading>
					<Text color="fg.muted">
						Heurísticas claras, hierarquia forte e feedback imediato — do
						primeiro segundo.
					</Text>
				</Stack>
				<SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5}>
					{BENEFITS.map((item) => (
						<HeliosCard key={item.title} interactive>
							<Flex
								w="10"
								h="10"
								align="center"
								justify="center"
								rounded="xl"
								bg="helios.subtle"
								color="helios.fg"
								mb={4}
							>
								<Icon as={item.icon} boxSize={5} />
							</Flex>
							<Heading as="h3" size="md" mb={2} fontFamily="heading">
								{item.title}
							</Heading>
							<Text fontSize="sm" color="fg.muted" lineHeight="tall">
								{item.body}
							</Text>
						</HeliosCard>
					))}
				</SimpleGrid>
			</Container>
		</Box>
	);
}

export function LandingFeatures() {
	return (
		<Box
			as="section"
			py={{ base: 16, md: 24 }}
			id="recursos"
			bg={{ _light: "blackAlpha.50", _dark: "whiteAlpha.50" }}
		>
			<Container maxW="7xl" px={{ base: 5, md: 8 }}>
				<Stack gap={3} mb={10} maxW="2xl">
					<SectionLabel>Recursos</SectionLabel>
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
					>
						Bento de capacidade real
					</Heading>
				</Stack>
				<SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
					{FEATURES.map((f) => (
						<Box key={f.title} gridColumn={f.span}>
							<HeliosCard interactive glow minH={{ md: "180px" }} h="full">
								<Heading as="h3" size="lg" fontFamily="heading" mb={2}>
									{f.title}
								</Heading>
								<Text color="fg.muted">{f.body}</Text>
							</HeliosCard>
						</Box>
					))}
				</SimpleGrid>
			</Container>
		</Box>
	);
}

export function LandingDemo() {
	return (
		<Box as="section" py={{ base: 16, md: 24 }} id="demo">
			<Container maxW="7xl" px={{ base: 5, md: 8 }}>
				<Stack gap={3} mb={10} maxW="2xl">
					<SectionLabel>Demonstração</SectionLabel>
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
					>
						Um CRM que parece produto bilionário
					</Heading>
					<Text color="fg.muted">
						Captura real do dashboard — insights, ações rápidas e widgets no
						mesmo panorama.
					</Text>
				</Stack>
				<HeliosCard
					p={0}
					overflow="hidden"
					borderColor="helios.border"
					shadow="heliosLg"
				>
					<Box as="picture" display="block" w="full">
						<source srcSet={telaAdminWebp} type="image/webp" />
						<Image
							src={telaAdminPng}
							alt="Dashboard Helios Labs — painel administrativo com insights, ações rápidas e widgets"
							w="full"
							h="auto"
							display="block"
							loading="lazy"
							decoding="async"
							fetchPriority="low"
						/>
					</Box>
				</HeliosCard>
			</Container>
		</Box>
	);
}

export function LandingHowItWorks() {
	return (
		<Box as="section" py={{ base: 16, md: 24 }} id="como-funciona">
			<Container maxW="7xl" px={{ base: 5, md: 8 }}>
				<Stack gap={3} mb={10} maxW="2xl">
					<SectionLabel>Como funciona</SectionLabel>
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
					>
						Três passos. Zero drama.
					</Heading>
				</Stack>
				<SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
					{STEPS.map((step, i) => (
						<Stack key={step.title} gap={3}>
							<Text
								fontFamily="heading"
								fontWeight="800"
								fontSize="4xl"
								color="helios.fg"
								lineHeight="1"
							>
								0{i + 1}
							</Text>
							<Heading as="h3" size="md" fontFamily="heading">
								{step.title}
							</Heading>
							<Text color="fg.muted">{step.body}</Text>
						</Stack>
					))}
				</SimpleGrid>
			</Container>
		</Box>
	);
}

export function LandingFaq() {
	return (
		<Box
			as="section"
			py={{ base: 16, md: 24 }}
			id="faq"
			bg={{ _light: "blackAlpha.50", _dark: "whiteAlpha.50" }}
		>
			<Container maxW="3xl" px={{ base: 5, md: 8 }}>
				<Stack gap={3} mb={8} textAlign="center">
					<SectionLabel>FAQ</SectionLabel>
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
					>
						Módulos do Helios
					</Heading>
					<Text color="fg.muted">
						Perguntas objetivas sobre cada peça do ecossistema.
					</Text>
				</Stack>
				<Accordion.Root multiple defaultValue={[FAQ[0]?.q]}>
					{FAQ.map((item) => (
						<Accordion.Item key={item.q} value={item.q} borderColor="border">
							<Accordion.ItemTrigger py={4} fontWeight="600">
								{item.q}
								<Accordion.ItemIndicator />
							</Accordion.ItemTrigger>
							<Accordion.ItemContent>
								<Accordion.ItemBody pb={4} color="fg.muted">
									{item.a}
								</Accordion.ItemBody>
							</Accordion.ItemContent>
						</Accordion.Item>
					))}
				</Accordion.Root>
			</Container>
		</Box>
	);
}

export function LandingCta() {
	return (
		<Box
			as="section"
			py={{ base: 16, md: 24 }}
			position="relative"
			overflow="hidden"
		>
			<SolarGlow intensity="soft" />
			<Container
				maxW="4xl"
				px={{ base: 5, md: 8 }}
				position="relative"
				zIndex={1}
			>
				<HeliosCard
					textAlign="center"
					borderColor="helios.border"
					shadow="solarGlowSoft"
					py={{ base: 10, md: 14 }}
				>
					<Icon as={LuCheck} boxSize={8} color="helios.fg" mb={4} />
					<Heading
						as="h2"
						size="2xl"
						fontFamily="heading"
						letterSpacing="-0.03em"
						mb={3}
					>
						Pronto para iluminar sua operação?
					</Heading>
					<Text color="fg.muted" mb={8} maxW="lg" mx="auto">
						Entre agora ou fale com a gente. Experiência premium, do hero ao
						dashboard.
					</Text>
					<Flex
						gap={3}
						justify="center"
						direction={{ base: "column", sm: "row" }}
					>
						<Button asChild size="lg" colorPalette="helios" px={8}>
							<Link to="/login">Entrar no Helios Labs</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link to="/contato">Falar conosco</Link>
						</Button>
					</Flex>
				</HeliosCard>
			</Container>
		</Box>
	);
}

export function MarketingFooter() {
	return (
		<Box
			as="footer"
			borderTopWidth="1px"
			borderColor="border"
			bg="helios.canvas"
			py={{ base: 10, md: 12 }}
		>
			<Container maxW="7xl" px={{ base: 5, md: 8 }}>
				<Flex
					direction={{ base: "column", md: "row" }}
					justify="space-between"
					gap={8}
				>
					<Stack gap={3} maxW="sm">
						<BrandMark size="sm" showTagline />
						<Text fontSize="sm" color="fg.muted">
							Software de próxima geração — luz, precisão e controle.
						</Text>
					</Stack>
					<SimpleGrid columns={{ base: 2, sm: 3 }} gap={6} fontSize="sm">
						<Stack gap={2}>
							<Text fontWeight="700">Produto</Text>
							<Link to="/#recursos">Recursos</Link>
							<Link to="/consultar-itr">Consultar ITR</Link>
							<Link to="/login">Entrar</Link>
						</Stack>
						<Stack gap={2}>
							<Text fontWeight="700">Empresa</Text>
							<Link to="/contato">Contato</Link>
							<Link to="/#faq">FAQ</Link>
						</Stack>
						<Stack gap={2}>
							<Text fontWeight="700">Legal</Text>
							<Text color="fg.muted">
								© {new Date().getFullYear()} Helios Labs
							</Text>
						</Stack>
					</SimpleGrid>
				</Flex>
			</Container>
		</Box>
	);
}
