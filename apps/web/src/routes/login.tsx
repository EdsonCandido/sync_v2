import SignInForm from "@/components/sign-in-form";

import type { Route } from "./+types/login";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Entrar — Helios Labs" },
		{
			name: "description",
			content: "Acesse sua conta Helios Labs com e-mail e senha.",
		},
	];
}

export default function Login() {
	return <SignInForm />;
}
