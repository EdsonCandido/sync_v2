import { Box } from "@chakra-ui/react";
import { lazy, Suspense, useRef } from "react";

import { LandingHero } from "@/components/marketing/LandingSections";
import { ConstellationField } from "@/components/ui/ConstellationField";

import type { Route } from "./+types/_index";

const LandingBenefits = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingBenefits,
	})),
);
const LandingFeatures = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingFeatures,
	})),
);
const LandingDemo = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingDemo,
	})),
);
const LandingHowItWorks = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingHowItWorks,
	})),
);
const LandingFaq = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingFaq,
	})),
);
const LandingCta = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.LandingCta,
	})),
);
const MarketingFooter = lazy(() =>
	import("@/components/marketing/LandingSections").then((m) => ({
		default: m.MarketingFooter,
	})),
);

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Helios Labs — CRM powered by light" },
		{
			name: "description",
			content:
				"CRM de próxima geração: inteligência, precisão e velocidade alimentadas pela energia do Sol.",
		},
	];
}

export default function Home() {
	const mainRef = useRef<HTMLElement | null>(null);

	return (
		<Box
			as="main"
			ref={mainRef}
			position="relative"
			bg="helios.canvas"
			color="fg"
			minH="100%"
		>
			<ConstellationField
				trackRef={mainRef}
				density="page"
				position="fixed"
				inset={0}
				zIndex={0}
				opacity={0.85}
			/>
			<Box position="relative" zIndex={1}>
				<LandingHero />
				<Suspense fallback={null}>
					<LandingBenefits />
					<LandingFeatures />
					<LandingDemo />
					<LandingHowItWorks />
					<LandingFaq />
					<LandingCta />
					<MarketingFooter />
				</Suspense>
			</Box>
		</Box>
	);
}
