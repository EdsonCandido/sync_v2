import { HStack, Spinner } from "@chakra-ui/react";
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";

import { useModuleAccess } from "@/components/dashboard/ModuleAccessProvider";
import type { ModuleKey } from "@/lib/module-permissions-api";

type ModuleGateProps = {
	moduleKey: ModuleKey;
	children: ReactNode;
};

export function ModuleGate({ moduleKey, children }: ModuleGateProps) {
	const navigate = useNavigate();
	const { loading, canRead } = useModuleAccess();

	useEffect(() => {
		if (loading) return;
		if (!canRead(moduleKey)) {
			navigate("/dashboard", { replace: true });
		}
	}, [loading, canRead, moduleKey, navigate]);

	if (loading || !canRead(moduleKey)) {
		return (
			<HStack justify="center" py={16}>
				<Spinner />
			</HStack>
		);
	}

	return <>{children}</>;
}
