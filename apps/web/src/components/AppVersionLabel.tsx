import { Text } from "@chakra-ui/react";

import { APP_VERSION } from "@/lib/app-version";

export function AppVersionLabel() {
	return (
		<Text fontSize="2xs" color="fg.muted" letterSpacing="0.04em">
			versão {APP_VERSION}
		</Text>
	);
}
