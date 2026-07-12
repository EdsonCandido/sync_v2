import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

type DashboardEmptyStateProps = {
	onRetry?: () => void;
};

export function DashboardEmptyState({ onRetry }: DashboardEmptyStateProps) {
	return (
		<Box
			p={{ base: 8, md: 12 }}
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="2xl"
			textAlign="center"
		>
			<VStack gap={4}>
				<Heading as="h2" size="lg" fontFamily="heading">
					Sem dados ainda
				</Heading>
				<Text color="fg.muted" maxW="md">
					Quando houver usuários, acessos e pendências, o panorama da empresa
					aparece aqui.
				</Text>
				{onRetry && (
					<Button colorPalette="helios" onClick={onRetry}>
						Atualizar
					</Button>
				)}
			</VStack>
		</Box>
	);
}
