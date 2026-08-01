import {
	Avatar,
	Badge,
	Button,
	CloseButton,
	DataList,
	Dialog,
	Field,
	HStack,
	IconButton,
	Input,
	InputGroup,
	Kbd,
	Menu,
	Popover,
	Portal,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuBell, LuMenu, LuSearch } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router";

import { ColorModeButton } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
	type AppNotification,
	notificationsApi,
} from "@/lib/notifications-api";
import {
	ensureNotificationPermission,
	showSystemReminder,
} from "@/lib/reminder-alerts";
import { usersApi } from "@/lib/users-api";

type DashboardNavbarProps = {
	onOpenSidebar: () => void;
};

function breadcrumbFromPath(pathname: string) {
	const parts = pathname.split("/").filter(Boolean);
	if (parts.length <= 1) return "Painel";
	const last = parts[parts.length - 1] ?? "Painel";
	return last
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function formatRelativeTime(dateIso: string) {
	const date = new Date(dateIso);
	const diffMs = Date.now() - date.getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "agora";
	if (mins < 60) return `há ${mins} min`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `há ${hours} h`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "ontem";
	return `há ${days} d`;
}

export function DashboardNavbar({ onOpenSidebar }: DashboardNavbarProps) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { data: session, isPending } = authClient.useSession();
	const [infoOpen, setInfoOpen] = useState(false);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);
	const [search, setSearch] = useState("");
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const seenIdsRef = useRef<Set<string>>(new Set());
	const bootstrappedRef = useRef(false);

	const userName = session?.user.name ?? "";
	const userEmail = session?.user.email ?? "";
	const crumb = breadcrumbFromPath(pathname);

	const loadNotifications = useCallback(async () => {
		if (!session?.user) return;
		try {
			const result = await notificationsApi.list();
			setNotifications(result.items);
			setUnreadCount(result.unreadCount);

			if (!bootstrappedRef.current) {
				for (const n of result.items) seenIdsRef.current.add(n.id);
				bootstrappedRef.current = true;
				ensureNotificationPermission();
				return;
			}

			for (const n of result.items) {
				if (seenIdsRef.current.has(n.id)) continue;
				seenIdsRef.current.add(n.id);
				if (n.kind === "appointment_reminder" && !n.readAt) {
					showSystemReminder({
						title: n.title,
						body: n.body,
						tag: n.id,
						appointmentId: n.appointmentId,
						withSound: true,
					});
				}
			}
		} catch {
			/* silent — navbar não deve quebrar */
		}
	}, [session?.user]);

	useEffect(() => {
		void loadNotifications();
		const id = window.setInterval(() => void loadNotifications(), 20_000);
		const onFocus = () => void loadNotifications();
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onFocus);
		return () => {
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onFocus);
		};
	}, [loadNotifications]);

	async function handleChangePassword() {
		if (newPassword.length < 6) {
			toaster.create({
				title: "Nova senha deve ter no mínimo 6 caracteres",
				type: "error",
			});
			return;
		}
		if (newPassword !== confirmPassword) {
			toaster.create({
				title: "Confirmação não confere com a nova senha",
				type: "error",
			});
			return;
		}
		setSavingPassword(true);
		try {
			await usersApi.changeOwnPassword(currentPassword, newPassword);
			toaster.create({ title: "Senha alterada", type: "success" });
			setPasswordOpen(false);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			toaster.create({
				title:
					error instanceof ApiError ? error.message : "Falha ao trocar senha",
				type: "error",
			});
		} finally {
			setSavingPassword(false);
		}
	}

	return (
		<>
			<HStack
				as="header"
				justify="space-between"
				px={{ base: 3, md: 6 }}
				py={2}
				borderBottomWidth="1px"
				borderColor="border"
				bg="dash.navbar"
				backdropFilter="blur(14px)"
				minH="14"
				gap={3}
			>
				<HStack gap={3} flex="1" minW={0}>
					<IconButton
						aria-label="Abrir menu"
						variant="ghost"
						size="sm"
						color="fg.muted"
						_hover={{ bg: "bg.muted", color: "helios.fg" }}
						display={{ base: "inline-flex", md: "none" }}
						onClick={onOpenSidebar}
					>
						<LuMenu />
					</IconButton>
					<Stack gap={0} display={{ base: "none", md: "flex" }} minW={0}>
						<Text fontSize="xs" color="fg.muted" fontWeight="500">
							Helios Labs
						</Text>
						<Text fontSize="sm" fontWeight="600" truncate>
							{crumb}
						</Text>
					</Stack>

					<InputGroup
						maxW="sm"
						flex="1"
						display={{ base: "none", lg: "flex" }}
						startElement={<LuSearch />}
						endElement={
							<HStack gap={1} me={1}>
								<Kbd size="sm">⌘</Kbd>
								<Kbd size="sm">K</Kbd>
							</HStack>
						}
					>
						<Input
							placeholder="Busca global (demo)"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							aria-label="Busca global"
							bg="bg.subtle"
							borderColor="border"
							_focusVisible={{
								borderColor: "helios.solid",
								boxShadow: "0 0 0 1px var(--chakra-colors-helios-solid)",
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && search.trim()) {
									toaster.create({
										title: "Busca demo",
										description: `“${search.trim()}” — API em breve.`,
										type: "info",
									});
								}
							}}
						/>
					</InputGroup>
				</HStack>

				<HStack gap={1}>
					<IconButton
						aria-label="Buscar"
						variant="ghost"
						size="sm"
						display={{ base: "inline-flex", lg: "none" }}
						onClick={() =>
							toaster.create({
								title: "Busca global",
								description: "Disponível no desktop nesta demo.",
								type: "info",
							})
						}
					>
						<LuSearch />
					</IconButton>

					<Popover.Root positioning={{ placement: "bottom-end" }}>
						<Popover.Trigger asChild>
							<IconButton
								aria-label="Notificações"
								variant="ghost"
								size="sm"
								position="relative"
							>
								<LuBell />
								{unreadCount > 0 ? (
									<Badge
										position="absolute"
										top="0.5"
										right="0.5"
										rounded="full"
										bg="helios.solid"
										color="helios.contrast"
										fontSize="2xs"
										minW="4"
										h="4"
										px={0}
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										{unreadCount > 9 ? "9+" : unreadCount}
									</Badge>
								) : null}
							</IconButton>
						</Popover.Trigger>
						<Portal>
							<Popover.Positioner>
								<Popover.Content
									w="80"
									bg="bg.panel"
									borderColor="border"
									shadow="heliosMd"
								>
									<Popover.Header
										fontWeight="700"
										fontFamily="heading"
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										gap={2}
									>
										<span>Notificações</span>
										{unreadCount > 0 ? (
											<Button
												size="2xs"
												variant="ghost"
												onClick={() =>
													void notificationsApi
														.markAllRead()
														.then(() => loadNotifications())
												}
											>
												Marcar todas
											</Button>
										) : null}
									</Popover.Header>
									<Popover.Body>
										<VStack align="stretch" gap={3}>
											{notifications.length === 0 ? (
												<Text fontSize="sm" color="fg.muted">
													Nenhuma notificação.
												</Text>
											) : (
												notifications.map((n) => (
													<Stack
														key={n.id}
														gap={0.5}
														p={2}
														rounded="md"
														bg={n.readAt ? undefined : "helios.subtle"}
														_hover={{ bg: "helios.subtle" }}
														cursor="pointer"
														onClick={() =>
															void notificationsApi
																.markRead(n.id)
																.then(() => loadNotifications())
																.then(() => {
																	if (n.appointmentId) {
																		navigate("/dashboard/agendamentos");
																	}
																})
														}
													>
														<Text fontSize="sm" fontWeight="600">
															{n.title}
														</Text>
														<Text fontSize="xs" color="fg.muted">
															{n.body}
														</Text>
														<Text fontSize="2xs" color="fg.muted">
															{formatRelativeTime(n.createdAt)}
														</Text>
													</Stack>
												))
											)}
										</VStack>
									</Popover.Body>
								</Popover.Content>
							</Popover.Positioner>
						</Portal>
					</Popover.Root>

					<ColorModeButton />
					{isPending ? (
						<Skeleton h={9} w={28} rounded="md" />
					) : (
						session && (
							<Menu.Root>
								<Menu.Trigger asChild>
									<Button
										variant="ghost"
										size="sm"
										px={2}
										color="fg"
										_hover={{ bg: "bg.muted" }}
										_expanded={{ bg: "bg.muted" }}
									>
										<HStack gap={2}>
											<Avatar.Root
												size="xs"
												borderWidth="2px"
												borderColor="helios.solid"
											>
												<Avatar.Fallback
													name={userName}
													bg="helios.solid"
													color="helios.contrast"
												/>
											</Avatar.Root>
											<Text
												display={{ base: "none", sm: "block" }}
												fontWeight="medium"
												maxW="40"
												truncate
											>
												{userName}
											</Text>
										</HStack>
									</Button>
								</Menu.Trigger>
								<Portal>
									<Menu.Positioner>
										<Menu.Content minW="52" bg="bg.panel" borderColor="border">
											<Menu.ItemGroup>
												<Menu.ItemGroupLabel color="fg.muted">
													Minha conta
												</Menu.ItemGroupLabel>
												<Menu.Separator />
												<Menu.Item
													value="info"
													_highlighted={{
														bg: "helios.muted",
														color: "helios.fg",
													}}
													onSelect={() => setInfoOpen(true)}
												>
													Exibir informações
												</Menu.Item>
												<Menu.Item
													value="password"
													_highlighted={{
														bg: "helios.muted",
														color: "helios.fg",
													}}
													onSelect={() => setPasswordOpen(true)}
												>
													Trocar senha
												</Menu.Item>
												<Menu.Separator />
												<Menu.Item
													value="sign-out"
													color="fg.error"
													_highlighted={{
														bg: "bg.error",
														color: "fg.error",
													}}
													onSelect={() => {
														authClient.signOut({
															fetchOptions: {
																onSuccess: () => {
																	navigate("/");
																},
															},
														});
													}}
												>
													Sair
												</Menu.Item>
											</Menu.ItemGroup>
										</Menu.Content>
									</Menu.Positioner>
								</Portal>
							</Menu.Root>
						)
					)}
				</HStack>
			</HStack>

			<Dialog.Root
				open={infoOpen}
				onOpenChange={(e) => setInfoOpen(e.open)}
				placement="center"
			>
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner>
						<Dialog.Content bg="bg.panel" borderColor="border">
							<Dialog.Header>
								<Dialog.Title>Informações da conta</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<DataList.Root orientation="horizontal">
									<DataList.Item>
										<DataList.ItemLabel>Nome</DataList.ItemLabel>
										<DataList.ItemValue>{userName}</DataList.ItemValue>
									</DataList.Item>
									<DataList.Item>
										<DataList.ItemLabel>E-mail</DataList.ItemLabel>
										<DataList.ItemValue>{userEmail}</DataList.ItemValue>
									</DataList.Item>
								</DataList.Root>
							</Dialog.Body>
							<Dialog.Footer>
								<Dialog.ActionTrigger asChild>
									<Button
										bg="helios.solid"
										color="helios.contrast"
										_hover={{
											bg: "helios.emphasized",
											color: "helios.contrast",
										}}
									>
										Fechar
									</Button>
								</Dialog.ActionTrigger>
							</Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" />
							</Dialog.CloseTrigger>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>

			<Dialog.Root
				open={passwordOpen}
				onOpenChange={(e) => {
					setPasswordOpen(e.open);
					if (!e.open) {
						setCurrentPassword("");
						setNewPassword("");
						setConfirmPassword("");
					}
				}}
				placement="center"
			>
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner>
						<Dialog.Content bg="bg.panel" borderColor="border">
							<Dialog.Header>
								<Dialog.Title>Trocar senha</Dialog.Title>
							</Dialog.Header>
							<Dialog.Body>
								<Stack gap={3}>
									<Field.Root required>
										<Field.Label>Senha atual</Field.Label>
										<Input
											type="password"
											value={currentPassword}
											autoComplete="current-password"
											onChange={(e) => setCurrentPassword(e.target.value)}
										/>
									</Field.Root>
									<Field.Root required>
										<Field.Label>Nova senha</Field.Label>
										<Input
											type="password"
											value={newPassword}
											autoComplete="new-password"
											onChange={(e) => setNewPassword(e.target.value)}
										/>
									</Field.Root>
									<Field.Root required>
										<Field.Label>Confirmar nova senha</Field.Label>
										<Input
											type="password"
											value={confirmPassword}
											autoComplete="new-password"
											onChange={(e) => setConfirmPassword(e.target.value)}
										/>
									</Field.Root>
								</Stack>
							</Dialog.Body>
							<Dialog.Footer>
								<Dialog.ActionTrigger asChild>
									<Button variant="outline">Cancelar</Button>
								</Dialog.ActionTrigger>
								<Button
									bg="helios.solid"
									color="helios.contrast"
									loading={savingPassword}
									onClick={() => void handleChangePassword()}
								>
									Salvar
								</Button>
							</Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<CloseButton size="sm" />
							</Dialog.CloseTrigger>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
}
