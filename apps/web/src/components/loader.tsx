import { Center, Spinner } from "@chakra-ui/react";

export default function Loader() {
	return (
		<Center h="full" pt={8}>
			<Spinner size="lg" />
		</Center>
	);
}
