import {
	Avatar,
	Button,
	CloseButton,
	DataList,
	Dialog,
	Field,
	HStack,
	IconButton,
	Input,
	Menu,
	Portal,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { useNavigate } from "react-router";

import { ColorModeButton } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { usersApi } from "@/lib/users-api";

type DashboardNavbarProps = {
	onOpenSidebar: () => void;
};

export function DashboardNavbar({ onOpenSidebar }: DashboardNavbarProps) {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [infoOpen, setInfoOpen] = useState(false);
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);

	const userName = session?.user.name ?? "";
	const userEmail = session?.user.email ?? "";

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
				backdropFilter="blur(12px)"
				minH="14"
			>
				<HStack gap={2}>
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
					<Text
						display={{ base: "none", md: "block" }}
						fontSize="sm"
						color="fg.muted"
						fontWeight="500"
					>
						Painel
					</Text>
				</HStack>

				<HStack gap={2}>
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
