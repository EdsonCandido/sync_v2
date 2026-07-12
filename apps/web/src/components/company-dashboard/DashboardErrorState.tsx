import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

type DashboardErrorStateProps = {
	message?: string;
	onRetry: () => void;
};

export function DashboardErrorState({
	message,
	onRetry,
}: DashboardErrorStateProps) {
	return (
		<Box
			p={{ base: 8, md: 12 }}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="red.emphasized"
			borderRadius="2xl"
			textAlign="center"
		>
			<VStack gap={4}>
				<Heading as="h2" size="lg" fontFamily="heading" color="red.fg">
					Não foi possível carregar
				</Heading>
				<Text color="fg.muted" maxW="md">
					{message ?? "Tente novamente em instantes."}
				</Text>
				<Button colorPalette="helios" onClick={onRetry}>
					Tentar de novo
				</Button>
			</VStack>
		</Box>
	);
}
