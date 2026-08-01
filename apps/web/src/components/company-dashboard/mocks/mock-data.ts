export type MockWidgetId =
	| "calendar"
	| "timeline"
	| "favorites"
	| "goals"
	| "finance"
	| "alerts";

export const MOCK_CALENDAR_EVENTS = [
	{ day: 1, label: "Reunião comercial", time: "09:00" },
	{ day: 2, label: "Fechamento ITR", time: "14:30" },
	{ day: 4, label: "Review financeiro", time: "11:00" },
	{ day: 5, label: "Kanban sprint", time: "16:00" },
] as const;

export const MOCK_TIMELINE = [
	{
		id: "t1",
		title: "Usuário convidado",
		meta: "Ana · há 20 min",
		tone: "info" as const,
	},
	{
		id: "t2",
		title: "Lançamento liquidado",
		meta: "R$ 4.200 · há 1 h",
		tone: "success" as const,
	},
	{
		id: "t3",
		title: "Card atrasado",
		meta: "Kanban · há 3 h",
		tone: "warning" as const,
	},
	{
		id: "t4",
		title: "Alerta de plano",
		meta: "12 dias para renovação",
		tone: "error" as const,
	},
] as const;

export const MOCK_FAVORITES = [
	{ id: "f1", label: "Clientes", path: "/dashboard/clientes" },
	{ id: "f2", label: "Kanban", path: "/dashboard/kanban" },
	{ id: "f3", label: "Financeiro", path: "/dashboard/financeiro" },
	{ id: "f4", label: "Relatórios", path: "/dashboard/financeiro/relatorios" },
] as const;

export const MOCK_GOALS = [
	{ id: "g1", label: "Retenção mensal", progress: 78, target: "90%" },
	{ id: "g2", label: "Tickets resolvidos", progress: 62, target: "120" },
	{ id: "g3", label: "NPS interno", progress: 88, target: "85" },
] as const;

export const MOCK_FINANCE = {
	receber: "R$ 128.400",
	pagar: "R$ 74.210",
	saldo: "R$ 54.190",
	trend: "+8,4%",
} as const;

export const MOCK_ALERTS = [
	{
		id: "a1",
		level: "warning" as const,
		title: "3 contas a pagar vencem em 48h",
	},
	{
		id: "a2",
		level: "info" as const,
		title: "2 cards sem responsável no Kanban",
	},
	{
		id: "a3",
		level: "error" as const,
		title: "Falha de sync ITR (demo)",
	},
] as const;

export const DEFAULT_WIDGET_ORDER: MockWidgetId[] = [
	"calendar",
	"timeline",
	"favorites",
	"goals",
	"finance",
	"alerts",
];
