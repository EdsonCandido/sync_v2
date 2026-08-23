import { DASHBOARD_MODULES } from "@/components/dashboard/modules";

export const APP_NAME = "Helios Labs";

/** Labels amigáveis para segmentos de subrotas (ex.: financeiro). */
const SEGMENT_LABELS: Record<string, string> = {
	"contas-a-receber": "Contas a Receber",
	"contas-a-pagar": "Contas a Pagar",
	categorias: "Categorias",
	"centros-de-custo": "Centros de Custo",
	bancos: "Bancos",
	fornecedores: "Fornecedores",
	relatorios: "Relatórios",
};

function humanizeSegment(segment: string): string {
	return segment
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname || "/";
}

function findModuleForPath(pathname: string) {
	const path = normalizePath(pathname);
	const sorted = [...DASHBOARD_MODULES].sort(
		(a, b) => b.path.length - a.path.length,
	);

	for (const mod of sorted) {
		if (mod.end) {
			if (path === mod.path) return mod;
			continue;
		}
		if (path === mod.path || path.startsWith(`${mod.path}/`)) {
			return mod;
		}
	}

	return null;
}

function labelForPath(pathname: string): string {
	const path = normalizePath(pathname);
	const mod = findModuleForPath(path);

	if (!mod) {
		return "Painel";
	}

	if (path === mod.path) {
		return mod.label;
	}

	const rest = path.slice(mod.path.length).replace(/^\//, "");
	const segments = rest.split("/").filter(Boolean);
	const last = segments[segments.length - 1];
	if (!last) {
		return mod.label;
	}

	return SEGMENT_LABELS[last] ?? humanizeSegment(last);
}

export function documentTitleForPath(pathname: string): string {
	return `${APP_NAME} | ${labelForPath(pathname)}`;
}
