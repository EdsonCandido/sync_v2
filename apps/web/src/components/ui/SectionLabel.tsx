import { Text, type TextProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

type SectionLabelProps = TextProps & {
	children: ReactNode;
};

export function SectionLabel({ children, ...rest }: SectionLabelProps) {
	return (
		<Text
			fontSize="sm"
			fontWeight="600"
			color="helios.fg"
			letterSpacing="0.06em"
			textTransform="uppercase"
			{...rest}
		>
			{children}
		</Text>
	);
}
