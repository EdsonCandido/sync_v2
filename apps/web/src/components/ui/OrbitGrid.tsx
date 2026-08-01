import { Box, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

type OrbitGridProps = BoxProps;

export function OrbitGrid(props: OrbitGridProps) {
	return (
		<Box
			position="absolute"
			inset={0}
			overflow="hidden"
			pointerEvents="none"
			aria-hidden
			{...props}
		>
			<Box
				position="absolute"
				inset={0}
				opacity={{ _light: 0.35, _dark: 0.22 }}
				bgImage="radial-gradient(circle at 1px 1px, {colors.helios.400} 1px, transparent 0)"
				bgSize="48px 48px"
				maskImage="radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)"
			/>
			{[0.35, 0.55, 0.75].map((scale, i) => (
				<MotionBox
					key={scale}
					position="absolute"
					top="50%"
					left="60%"
					w={`${scale * 100}%`}
					h={`${scale * 100}%`}
					maxW="720px"
					maxH="720px"
					transform="translate(-50%, -50%)"
					borderRadius="full"
					borderWidth="1px"
					borderColor="helios.border"
					opacity={0.25 - i * 0.05}
					animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
					transition={{
						duration: 80 + i * 20,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
			))}
			<Box
				position="absolute"
				top="48%"
				left="58%"
				w="3"
				h="3"
				rounded="full"
				bg="helios.solid"
				shadow="solarGlow"
				transform="translate(-50%, -50%)"
			/>
		</Box>
	);
}
