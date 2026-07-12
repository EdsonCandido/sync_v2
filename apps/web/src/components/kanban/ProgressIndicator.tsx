import { Box, HStack, Progress, Text } from "@chakra-ui/react";
import { memo } from "react";

type ProgressIndicatorProps = {
	done: number;
	total: number;
};

export const ProgressIndicator = memo(function ProgressIndicator({
	done,
	total,
}: ProgressIndicatorProps) {
	if (total <= 0) return null;
	const value = Math.round((done / total) * 100);

	return (
		<Box>
			<HStack justify="space-between" mb={1}>
				<Text fontSize="2xs" color="fg.muted">
					Checklist
				</Text>
				<Text fontSize="2xs" color="fg.muted" fontWeight="600">
					{done}/{total}
				</Text>
			</HStack>
			<Progress.Root
				value={value}
				size="xs"
				colorPalette="helios"
				rounded="full"
			>
				<Progress.Track>
					<Progress.Range />
				</Progress.Track>
			</Progress.Root>
		</Box>
	);
});
