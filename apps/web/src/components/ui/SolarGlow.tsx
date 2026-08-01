import { Box, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

type SolarGlowProps = BoxProps & {
	intensity?: "soft" | "strong";
};

export function SolarGlow({ intensity = "soft", ...rest }: SolarGlowProps) {
	const opacity = intensity === "strong" ? 0.45 : 0.30;

	return (
		<Box
			position="absolute"
			inset={0}
			overflow="hidden"
			pointerEvents="none"
			aria-hidden
			{...rest}
		>
			<MotionBox
				position="absolute"
				top="-18%"
				right="-8%"
				w={{ base: "75vw", md: "48vw" }}
				h={{ base: "75vw", md: "48vw" }}
				borderRadius="full"
				bg="helios.400"
				opacity={opacity}
				filter="blur(64px)"
				animate={{
					scale: [1, 1.08, 1],
					opacity: [opacity, opacity * 1.15, opacity],
				}}
				transition={{
					duration: 10,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>
			<MotionBox
				position="absolute"
				bottom="-12%"
				left="-6%"
				w={{ base: "55vw", md: "36vw" }}
				h={{ base: "55vw", md: "36vw" }}
				borderRadius="full"
				bg="helios.600"
				opacity={opacity * 0.7}
				filter="blur(72px)"
				animate={{ scale: [1.05, 1, 1.05] }}
				transition={{
					duration: 12,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>
			<Box
				position="absolute"
				top="30%"
				left="40%"
				w={{ base: "30vw", md: "18vw" }}
				h={{ base: "30vw", md: "18vw" }}
				borderRadius="full"
				bg="helios.200"
				opacity={0.18}
				filter="blur(48px)"
			/>
		</Box>
	);
}
