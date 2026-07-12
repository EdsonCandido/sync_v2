import { Heading, Text } from "@chakra-ui/react";

type ModulePlaceholderProps = {
	title: string;
};

export function ModulePlaceholder({ title }: ModulePlaceholderProps) {
	return (
		<>
			<Text
				fontSize="sm"
				fontWeight="600"
				color="helios.fg"
				letterSpacing="0.06em"
				textTransform="uppercase"
				mb={2}
			>
				Módulo
			</Text>
			<Heading
				as="h1"
				size="xl"
				fontFamily="heading"
				fontWeight="800"
				letterSpacing="-0.03em"
				color="fg"
			>
				{title}
			</Heading>
			<Text mt={3} color="fg.muted">
				Conteúdo em breve.
			</Text>
		</>
	);
}
