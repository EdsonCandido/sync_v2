import { Box, Drawer, Flex, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { Outlet } from "react-router";

import { SolarGlow } from "@/components/ui/SolarGlow";
import { useAppointmentReminderAlerts } from "@/hooks/useAppointmentReminderAlerts";
import { authClient } from "@/lib/auth-client";

import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { ModuleAccessProvider } from "./ModuleAccessProvider";

export function DashboardShell() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { data: session } = authClient.useSession();
	useAppointmentReminderAlerts(session?.user?.id);

	return (
		<ModuleAccessProvider>
			<a
				href="#dashboard-main"
				style={{
					position: "absolute",
					left: "-9999px",
					top: "8px",
					zIndex: 100,
					background: "var(--chakra-colors-helios-solid)",
					color: "var(--chakra-colors-helios-contrast)",
					padding: "8px 12px",
					borderRadius: "8px",
					fontSize: "14px",
					fontWeight: 600,
				}}
				onFocus={(e) => {
					e.currentTarget.style.left = "8px";
				}}
				onBlur={(e) => {
					e.currentTarget.style.left = "-9999px";
				}}
			>
				Ir para o conteúdo
			</a>
			<Flex
				h="100svh"
				overflow="hidden"
				bg="helios.canvas"
				color="fg"
				position="relative"
			>
				<Box
					position="absolute"
					inset={0}
					pointerEvents="none"
					zIndex={0}
					bgImage={{
						_light:
							"radial-gradient(circle at top left, rgba(253,184,19,0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(255,138,0,0.06), transparent 50%)",
						_dark:
							"radial-gradient(circle at top left, rgba(253,184,19,0.1), transparent 45%), radial-gradient(circle at bottom right, rgba(253,184,19,0.05), transparent 50%)",
					}}
				/>
				<SolarGlow
					intensity="soft"
					opacity={0.35}
					display={{ base: "none", lg: "block" }}
				/>

				<Box
					as="aside"
					display={{ base: "none", md: "block" }}
					w="64"
					flexShrink={0}
					borderRightWidth="1px"
					borderColor="border"
					bg="dash.sidebar"
					backdropFilter="blur(14px)"
					position="relative"
					zIndex={1}
				>
					<DashboardSidebar />
				</Box>

				<Flex
					direction="column"
					flex="1"
					minW={0}
					position="relative"
					zIndex={1}
				>
					<DashboardNavbar onOpenSidebar={() => setDrawerOpen(true)} />
					<Box
						as="main"
						id="dashboard-main"
						flex="1"
						overflowY="auto"
						p={{ base: 4, md: 8 }}
						tabIndex={-1}
					>
						<Outlet />
					</Box>
				</Flex>
			</Flex>

			<Drawer.Root
				open={drawerOpen}
				onOpenChange={(e) => setDrawerOpen(e.open)}
				placement="start"
			>
				<Portal>
					<Drawer.Backdrop />
					<Drawer.Positioner>
						<Drawer.Content
							maxW="64"
							bg="bg.panel"
							borderRightWidth="1px"
							borderColor="border"
							color="fg"
						>
							<Drawer.Body p={0}>
								<DashboardSidebar onNavigate={() => setDrawerOpen(false)} />
							</Drawer.Body>
						</Drawer.Content>
					</Drawer.Positioner>
				</Portal>
			</Drawer.Root>
		</ModuleAccessProvider>
	);
}
