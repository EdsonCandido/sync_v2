import { Box, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { authClient } from "@/lib/auth-client";

export default function DashboardLayout() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	useEffect(() => {
		if (!session && !isPending) {
			navigate("/login");
		}
	}, [session, isPending, navigate]);

	if (isPending) {
		return (
			<Box p={4}>
				<Spinner />
			</Box>
		);
	}

	if (!session) {
		return null;
	}

	return <DashboardShell />;
}
