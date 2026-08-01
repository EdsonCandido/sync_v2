import {
	Box,
	type BoxProps,
	Button,
	Heading,
	Text,
	VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type EmptyStateProps = BoxProps & {
	title: string;
	description: ReactNode;
	actionLabel?: string;
	onAction?: () => void;
};

export function EmptyState({
	title,
	description,
	actionLabel,
	onAction,
	...rest
}: EmptyStateProps) {
	return (
		<Box
			p={{ base: 8, md: 12 }}
			bg="helios.panel"
			borderWidth="1px"
			borderColor="border"
			borderRadius="heliosXl"
			textAlign="center"
			{...rest}
		>
			<VStack gap={4}>
				<Box
					w="12"
					h="12"
					rounded="full"
					bg="helios.subtle"
					borderWidth="1px"
					borderColor="helios.border"
					shadow="solarGlowSoft"
					aria-hidden
				/>
				<Heading as="h2" size="lg" fontFamily="heading">
					{title}
				</Heading>
				<Text color="fg.muted" maxW="md">
					{description}
				</Text>
				{onAction && actionLabel && (
					<Button colorPalette="helios" variant="solid" onClick={onAction}>
						{actionLabel}
					</Button>
				)}
			</VStack>
		</Box>
	);
}
