import { Button, Menu, Portal, Skeleton } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton h={9} w={24} />;
	}

	if (!session) {
		return (
			<Button asChild variant="outline" size="sm" colorPalette="helios">
				<Link to="/login">Entrar</Link>
			</Button>
		);
	}

	return (
		<Menu.Root>
			<Menu.Trigger asChild>
				<Button variant="outline" size="sm">
					{session.user.name}
				</Button>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.ItemGroup>
							<Menu.ItemGroupLabel>Minha conta</Menu.ItemGroupLabel>
							<Menu.Separator />
							<Menu.Item value="email" closeOnSelect={false}>
								{session.user.email}
							</Menu.Item>
							<Menu.Item
								value="sign-out"
								color="fg.error"
								_highlighted={{ bg: "bg.error", color: "fg.error" }}
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
	);
}
