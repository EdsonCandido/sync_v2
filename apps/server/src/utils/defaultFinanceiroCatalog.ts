import type { FinancialCategoryTipo } from "@sync_v2/types";

export type DefaultFinancialCategory = {
	name: string;
	tipo: FinancialCategoryTipo;
	cor: string;
	icone: string;
};

export type DefaultCostCenter = {
	name: string;
	codigo: string;
};

export const DEFAULT_RECEITA_CATEGORIES: readonly DefaultFinancialCategory[] = [
	{ name: "Venda", tipo: "receita", cor: "green", icone: "shopping" },
	{ name: "Serviços", tipo: "receita", cor: "blue", icone: "wrench" },
	{ name: "Mensalidades", tipo: "receita", cor: "teal", icone: "calendar" },
	{
		name: "Consultorias",
		tipo: "receita",
		cor: "purple",
		icone: "briefcase",
	},
	{ name: "Comissão", tipo: "receita", cor: "cyan", icone: "percent" },
];

export const DEFAULT_DESPESA_CATEGORIES: readonly DefaultFinancialCategory[] = [
	{ name: "Água", tipo: "despesa", cor: "blue", icone: "droplet" },
	{ name: "Energia", tipo: "despesa", cor: "yellow", icone: "zap" },
	{ name: "Internet", tipo: "despesa", cor: "orange", icone: "wifi" },
	{ name: "Salários", tipo: "despesa", cor: "red", icone: "users" },
	{ name: "Marketing", tipo: "despesa", cor: "pink", icone: "megaphone" },
	{ name: "Impostos", tipo: "despesa", cor: "gray", icone: "landmark" },
	{ name: "Combustível", tipo: "despesa", cor: "amber", icone: "fuel" },
];

export const DEFAULT_COST_CENTERS: readonly DefaultCostCenter[] = [
	{ name: "Administrativo", codigo: "ADM" },
	{ name: "Comercial", codigo: "COM" },
	{ name: "Marketing", codigo: "MKT" },
	{ name: "Financeiro", codigo: "FIN" },
	{ name: "TI", codigo: "TI" },
	{ name: "Operacional", codigo: "OPS" },
];

export const DEFAULT_FINANCIAL_CATEGORIES: readonly DefaultFinancialCategory[] =
	[...DEFAULT_RECEITA_CATEGORIES, ...DEFAULT_DESPESA_CATEGORIES];
