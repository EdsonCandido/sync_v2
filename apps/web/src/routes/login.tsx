import SignInForm from "@/components/sign-in-form";

import type { Route } from "./+types/login";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Entrar — Sync" },
		{
			name: "description",
			content: "Acesse sua conta Sync com e-mail e senha.",
		},
	];
}

export default function Login() {
	return <SignInForm />;
}
