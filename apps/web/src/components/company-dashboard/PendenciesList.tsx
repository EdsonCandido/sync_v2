import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";
import { PendencyItem } from "./PendencyItem";

type PendenciesListProps = {
	pendencies: CompanyDashboard["pendencies"];
};

export function PendenciesList({ pendencies }: PendenciesListProps) {
	return (
		<Box
			p={{ base: 5, md: 6 }}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
			shadow="heliosSm"
		>
			<Heading as="h2" size="md" fontFamily="heading" fontWeight="700" mb={1}>
				Pendências importantes
			</Heading>
			<Text fontSize="sm" color="fg.muted" mb={5}>
				Itens que precisam de atenção
			</Text>

			{pendencies.length === 0 ? (
				<Text color="fg.muted" py={10} textAlign="center">
					Nenhuma pendência no momento.
				</Text>
			) : (
				<VStack align="stretch" gap={3}>
					{pendencies.map((item) => (
						<PendencyItem key={item.id} item={item} />
					))}
				</VStack>
			)}
		</Box>
	);
}
