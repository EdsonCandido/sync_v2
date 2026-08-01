import { Box, type BoxProps, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

import { SectionLabel } from "./SectionLabel";

type PageHeaderProps = BoxProps & {
	eyebrow?: string;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
};

export function PageHeader({
	eyebrow,
	title,
	description,
	actions,
	...rest
}: PageHeaderProps) {
	return (
		<Box
			display="flex"
			flexDir={{ base: "column", md: "row" }}
			alignItems={{ md: "flex-end" }}
			justifyContent="space-between"
			gap={4}
			{...rest}
		>
			<Box maxW="2xl">
				{eyebrow && <SectionLabel mb={2}>{eyebrow}</SectionLabel>}
				<Heading
					as="h1"
					size="2xl"
					fontFamily="heading"
					fontWeight="800"
					letterSpacing="-0.03em"
					lineHeight="1.15"
					color="fg"
				>
					{title}
				</Heading>
				{description && (
					<Text mt={2} color="fg.muted" maxW="xl" lineHeight="tall">
						{description}
					</Text>
				)}
			</Box>
			{actions}
		</Box>
	);
}
