import { Code, Container, Grid, Heading, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import Header from "./components/header";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";

const GA_MEASUREMENT_ID = "G-94RFB4E3W1";

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap",
	},
];

function GoogleAnalyticsPageview() {
	const location = useLocation();
	const isFirstRender = useRef(true);

	useEffect(() => {
		// gtag('config') no <head> já envia a pageview inicial
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (typeof window.gtag !== "function") return;

		window.gtag("config", GA_MEASUREMENT_ID, {
			page_path: `${location.pathname}${location.search}`,
		});
	}, [location.pathname, location.search]);

	return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				{/* Google tag (gtag.js) */}
				<script
					async
					src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				/>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Google Analytics snippet
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${GA_MEASUREMENT_ID}');
						`,
					}}
				/>
			</head>
			<body>
				<Provider defaultTheme="dark" storageKey="sync-ui-color-mode">
					{children}
				</Provider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const { pathname } = useLocation();
	const isDashboard = pathname.startsWith("/dashboard");

	return (
		<>
			<GoogleAnalyticsPageview />
			{isDashboard ? (
				<>
					<Outlet />
					<Toaster />
				</>
			) : (
				<>
					<Grid templateRows="auto 1fr" h="100svh">
						<Header />
						<Outlet />
					</Grid>
					<Toaster />
				</>
			)}
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}
	return (
		<Container as="main" maxW="container.lg" pt={16} p={4}>
			<Heading as="h1" size="xl">
				{message}
			</Heading>
			<Text mt={2}>{details}</Text>
			{stack && (
				<Code
					as="pre"
					display="block"
					w="full"
					p={4}
					overflowX="auto"
					mt={4}
					whiteSpace="pre"
				>
					{stack}
				</Code>
			)}
		</Container>
	);
}
