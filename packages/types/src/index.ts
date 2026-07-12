/** Shared TypeScript types. No business logic. */

export const USER_PERFIS = ["super", "admin_empresa", "cliente"] as const;

export type UserPerfil = (typeof USER_PERFIS)[number];

export const APP_MODULES = [
	"clientes",
	"financeiro",
	"kanban",
	"usuarios",
] as const;

export type ModuleKey = (typeof APP_MODULES)[number];

export const PERSON_TYPES = ["PF", "PJ"] as const;

export type PersonType = (typeof PERSON_TYPES)[number];

export const MODULE_ACTIONS = ["read", "edit"] as const;

export type ModuleAction = (typeof MODULE_ACTIONS)[number];

export const USER_DEPARTMENTS = [
	"Financeiro",
	"Marketing",
	"Secretaria",
	"Comercial",
	"RH",
	"Administração",
] as const;

export type UserDepartment = (typeof USER_DEPARTMENTS)[number];

export const COMPANY_REQUEST_STATUSES = [
	"pending",
	"approved",
	"rejected",
] as const;

export type CompanyRequestStatus = (typeof COMPANY_REQUEST_STATUSES)[number];

export const COMPANY_PAYMENT_STATUSES = ["pending", "paid"] as const;

export type CompanyPaymentStatus = (typeof COMPANY_PAYMENT_STATUSES)[number];

export const PENDENCY_PRIORITIES = ["high", "medium", "low"] as const;

export type PendencyPriority = (typeof PENDENCY_PRIORITIES)[number];

export const PENDENCY_KINDS = [
	"pending_request",
	"expiring_contract",
	"pending_payment",
	"blocked_user",
	"inactive_user",
] as const;

export type PendencyKind = (typeof PENDENCY_KINDS)[number];

export const KPI_TRENDS = ["up", "down", "neutral"] as const;

export type KpiTrend = (typeof KPI_TRENDS)[number];

export const KANBAN_BASE_COLUMN_SLUGS = [
	"a_fazer",
	"em_execucao",
	"concluido",
	"cancelado",
] as const;

export type KanbanBaseColumnSlug = (typeof KANBAN_BASE_COLUMN_SLUGS)[number];

export const KANBAN_HISTORY_EVENT_TYPES = [
	"created",
	"updated",
	"moved",
	"observation",
	"checklist",
	"assignees",
	"tags",
	"attachment",
] as const;

export type KanbanHistoryEventType =
	(typeof KANBAN_HISTORY_EVENT_TYPES)[number];

export const KANBAN_TAG_COLORS = [
	"gray",
	"blue",
	"green",
	"orange",
	"purple",
] as const;

export type KanbanTagColor = (typeof KANBAN_TAG_COLORS)[number];

export const FINANCIAL_CATEGORY_TIPOS = ["receita", "despesa"] as const;

export type FinancialCategoryTipo = (typeof FINANCIAL_CATEGORY_TIPOS)[number];

export const BANK_ACCOUNT_TIPOS = [
	"corrente",
	"poupanca",
	"investimento",
	"outro",
] as const;

export type BankAccountTipo = (typeof BANK_ACCOUNT_TIPOS)[number];

export const FINANCIAL_ENTRY_KINDS = ["receber", "pagar"] as const;

export type FinancialEntryKind = (typeof FINANCIAL_ENTRY_KINDS)[number];

export const FINANCIAL_ORIGIN_TYPES = ["avulsa", "kanban", "manual"] as const;

export type FinancialOriginType = (typeof FINANCIAL_ORIGIN_TYPES)[number];

export const FINANCIAL_ENTRY_STATUSES = [
	"em_aberto",
	"parcial",
	"pago",
	"cancelado",
	"vencido",
] as const;

export type FinancialEntryStatus = (typeof FINANCIAL_ENTRY_STATUSES)[number];

export const FINANCIAL_HISTORY_ACTIONS = [
	"created",
	"updated",
	"cancelled",
	"received",
	"paid",
	"reversed",
	"renegotiated",
	"installment",
	"attachment",
] as const;

export type FinancialHistoryAction = (typeof FINANCIAL_HISTORY_ACTIONS)[number];
