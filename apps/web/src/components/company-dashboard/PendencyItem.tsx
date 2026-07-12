import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import type { CompanyDashboard } from "@/lib/company-dashboard-api";

type PendencyItemProps = {
	item: CompanyDashboard["pendencies"][number];
};

const PRIORITY_META = {
	high: { label: "Alta", colorPalette: "red", border: "red.solid" },
	medium: { label: "Média", colorPalette: "orange", border: "orange.solid" },
	low: { label: "Baixa", colorPalette: "gray", border: "border" },
} as const;

export function PendencyItem({ item }: PendencyItemProps) {
	const meta = PRIORITY_META[item.priority];

	return (
		<Flex
			align={{ base: "flex-start", sm: "center" }}
			justify="space-between"
			gap={4}
			p={4}
			borderWidth="1px"
			borderColor="border"
			borderLeftWidth="4px"
			borderLeftColor={meta.border}
			borderRadius="xl"
			bg="bg"
			flexDir={{ base: "column", sm: "row" }}
		>
			<Box>
				<Text fontWeight="700" fontFamily="heading" mb={1}>
					{item.title}
				</Text>
				<Text fontSize="sm" color="fg.muted">
					{item.description}
				</Text>
			</Box>
			<Badge colorPalette={meta.colorPalette} size="sm" variant="subtle">
				{meta.label}
			</Badge>
		</Flex>
	);
}
