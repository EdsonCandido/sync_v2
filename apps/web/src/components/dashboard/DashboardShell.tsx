import { Box, Drawer, Flex, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { Outlet } from "react-router";

import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { ModuleAccessProvider } from "./ModuleAccessProvider";

export function DashboardShell() {
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<ModuleAccessProvider>
			<Flex h="100svh" overflow="hidden" bg="bg" color="fg" position="relative">
				<Box
					position="absolute"
					inset={0}
					pointerEvents="none"
					zIndex={0}
					bgImage={{
						_light:
							"radial-gradient(circle at top left, rgba(234,179,8,0.14), transparent 45%), radial-gradient(circle at bottom right, rgba(250,204,21,0.08), transparent 50%)",
						_dark:
							"radial-gradient(circle at top left, rgba(250,204,21,0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(250,204,21,0.06), transparent 50%)",
					}}
				/>

				<Box
					as="aside"
					display={{ base: "none", md: "block" }}
					w="64"
					flexShrink={0}
					borderRightWidth="1px"
					borderColor="border"
					bg="dash.sidebar"
					backdropFilter="blur(12px)"
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
					<Box as="main" flex="1" overflowY="auto" p={{ base: 4, md: 8 }}>
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
