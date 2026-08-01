import type {
	CreateDashboardFavoriteInput,
	CreateDashboardGoalInput,
	DashboardWidgetId,
	UpdateDashboardFavoriteInput,
	UpdateDashboardGoalInput,
	UpdateDashboardWidgetLayoutInput,
} from "@sync_v2/contracts";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { CompanyActivityRepository } from "../repositories/CompanyActivityRepository";
import { CompanyContractRepository } from "../repositories/CompanyContractRepository";
import { CompanyPaymentRepository } from "../repositories/CompanyPaymentRepository";
import { CompanyRequestRepository } from "../repositories/CompanyRequestRepository";
import { DashboardFavoriteRepository } from "../repositories/DashboardFavoriteRepository";
import { DashboardGoalRepository } from "../repositories/DashboardGoalRepository";
import { DashboardWidgetLayoutRepository } from "../repositories/DashboardWidgetLayoutRepository";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { AppError } from "../utils/AppError";
import {
	addDays,
	formatRelativeTime,
	resolveAppointmentBounds,
	startOfLocalDay,
	timelineToneFromAction,
} from "./appointmentHelpers";

const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
	"calendar",
	"timeline",
	"favorites",
	"goals",
	"finance",
	"alerts",
];

const DEFAULT_FAVORITES = [
	{ label: "Clientes", path: "/dashboard/clientes" },
	{ label: "Kanban", path: "/dashboard/kanban" },
	{ label: "Financeiro", path: "/dashboard/financeiro" },
	{ label: "Agendamentos", path: "/dashboard/agendamentos" },
];

export class GetDashboardWidgetsService {
	constructor(
		private readonly layoutRepository = new DashboardWidgetLayoutRepository(),
		private readonly favoriteRepository = new DashboardFavoriteRepository(),
		private readonly goalRepository = new DashboardGoalRepository(),
		private readonly appointmentRepository = new AppointmentRepository(),
		private readonly activityRepository = new CompanyActivityRepository(),
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
		private readonly kanbanCardRepository = new KanbanCardRepository(),
		private readonly paymentRepository = new CompanyPaymentRepository(),
		private readonly contractRepository = new CompanyContractRepository(),
		private readonly requestRepository = new CompanyRequestRepository(),
	) {}

	async execute(params: { companyId: string; userId: string }) {
		const now = new Date();
		const from = startOfLocalDay(now);
		const to = addDays(from, 30);

		const [
			layoutRow,
			favoritesRows,
			goalsRows,
			appointments,
			activities,
			receber,
			pagar,
			saldo,
			kanbanDue,
			financeDue,
			payments,
			contracts,
			pendingRequests,
			overdueReceber,
		] = await Promise.all([
			this.layoutRepository.findByUser(params.companyId, params.userId),
			this.favoriteRepository.listByUser(params.companyId, params.userId),
			this.goalRepository.listByCompany(params.companyId),
			this.appointmentRepository.list({
				companyId: params.companyId,
				from,
				to,
			}),
			this.activityRepository.listRecent(params.companyId, 12),
			this.entryRepository
				.sumOpenOnTime(params.companyId, "receber")
				.then(
					async (onTime) =>
						onTime +
						(await this.entryRepository.sumOpenOverdue(
							params.companyId,
							"receber",
						)),
				),
			this.entryRepository
				.sumOpenOnTime(params.companyId, "pagar")
				.then(
					async (onTime) =>
						onTime +
						(await this.entryRepository.sumOpenOverdue(
							params.companyId,
							"pagar",
						)),
				),
			this.bankRepository.sumSaldoAtual(params.companyId),
			this.kanbanCardRepository.listDueBetween(params.companyId, from, to),
			this.entryRepository.listOpenDueBetween(params.companyId, from, to),
			this.paymentRepository.listPending(params.companyId, 10),
			this.contractRepository.listExpiringSoon(params.companyId, 30, 10),
			this.requestRepository.countPending(params.companyId),
			this.entryRepository.sumOpenOverdue(params.companyId, "receber"),
		]);

		let widgetOrder = DEFAULT_WIDGET_ORDER;
		if (layoutRow?.widgetOrder) {
			try {
				const parsed = JSON.parse(layoutRow.widgetOrder) as DashboardWidgetId[];
				if (Array.isArray(parsed) && parsed.length > 0) {
					widgetOrder = parsed;
				}
			} catch {
				/* keep default */
			}
		}

		const favorites =
			favoritesRows.length > 0
				? favoritesRows.map((f) => ({
						id: f.id,
						label: f.label,
						path: f.path,
						sortOrder: f.sortOrder,
					}))
				: DEFAULT_FAVORITES.map((f, i) => ({
						id: `seed-${i}`,
						label: f.label,
						path: f.path,
						sortOrder: i,
					}));

		const calendar = [
			...appointments.map((a) => {
				const bounds = resolveAppointmentBounds({
					slotKind: a.slotKind as "timed" | "all_day" | "morning" | "afternoon",
					date: a.date,
					startsAt: a.startsAt,
					endsAt: a.endsAt,
				});
				return {
					id: a.id,
					title: a.title,
					startsAt: bounds.startsAt ?? a.date,
					endsAt: bounds.endsAt,
					source: "appointment" as const,
					slotKind: a.slotKind as "timed" | "all_day" | "morning" | "afternoon",
				};
			}),
			...kanbanDue.flatMap((c) =>
				c.dueAt
					? [
							{
								id: `kanban-${c.id}`,
								title: c.title,
								startsAt: c.dueAt,
								endsAt: null,
								source: "kanban" as const,
							},
						]
					: [],
			),
			...financeDue.map((e) => ({
				id: `fin-${e.id}`,
				title:
					e.originLabel?.trim() ||
					(e.kind === "receber" ? "Conta a receber" : "Conta a pagar"),
				startsAt: e.dataVencimento,
				endsAt: null,
				source: "financeiro" as const,
			})),
			...payments.map((p) => ({
				id: `pay-${p.id}`,
				title: p.description,
				startsAt: p.dueDate,
				endsAt: null,
				source: "pagamento" as const,
			})),
			...contracts.map((c) => ({
				id: `ctr-${c.id}`,
				title: c.title,
				startsAt: c.expiresAt,
				endsAt: null,
				source: "contrato" as const,
			})),
		].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

		const trendPercent =
			receber > 0
				? Math.round(((receber - pagar) / receber) * 1000) / 10
				: null;

		const alerts: {
			id: string;
			level: "warning" | "info" | "error";
			title: string;
		}[] = [];
		if (pendingRequests > 0) {
			alerts.push({
				id: "pending-requests",
				level: "info",
				title: `${pendingRequests} solicitação(ões) pendente(s)`,
			});
		}
		if (overdueReceber > 0) {
			alerts.push({
				id: "overdue-receber",
				level: "error",
				title: `Inadimplência a receber: R$ ${overdueReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
			});
		}
		if (payments.length > 0) {
			alerts.push({
				id: "pending-payments",
				level: "warning",
				title: `${payments.length} pagamento(s) de plano pendente(s)`,
			});
		}

		return {
			layout: { widgetOrder },
			calendar,
			timeline: activities.map((a) => ({
				id: a.id,
				title: a.action,
				meta: `${a.userName} · ${formatRelativeTime(a.occurredAt)}`,
				tone: timelineToneFromAction(a.action),
				occurredAt: a.occurredAt,
			})),
			favorites,
			goals: goalsRows.map((g) => ({
				id: g.id,
				label: g.label,
				progress: g.progress,
				targetLabel: g.targetLabel,
			})),
			finance: {
				receber,
				pagar,
				saldo,
				trendPercent,
			},
			alerts,
		};
	}
}

export class UpdateDashboardWidgetLayoutService {
	constructor(
		private readonly layoutRepository = new DashboardWidgetLayoutRepository(),
	) {}

	async execute(
		input: UpdateDashboardWidgetLayoutInput,
		params: { companyId: string; userId: string },
	) {
		const row = await this.layoutRepository.upsert({
			companyId: params.companyId,
			userId: params.userId,
			widgetOrder: JSON.stringify(input.widgetOrder),
			updatedBy: params.userId,
		});
		return {
			widgetOrder: input.widgetOrder,
			id: row?.id,
		};
	}
}

export class CreateDashboardFavoriteService {
	constructor(
		private readonly favoriteRepository = new DashboardFavoriteRepository(),
	) {}

	async execute(
		input: CreateDashboardFavoriteInput,
		params: { companyId: string; userId: string },
	) {
		return this.favoriteRepository.create({
			...input,
			companyId: params.companyId,
			userId: params.userId,
			createdBy: params.userId,
		});
	}
}

export class UpdateDashboardFavoriteService {
	constructor(
		private readonly favoriteRepository = new DashboardFavoriteRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateDashboardFavoriteInput,
		params: { companyId: string; userId: string },
	) {
		const row = await this.favoriteRepository.update(
			id,
			params.companyId,
			params.userId,
			{ ...input, updatedBy: params.userId },
		);
		if (!row) throw new AppError(404, "Favorito não encontrado.");
		return row;
	}
}

export class SoftDeleteDashboardFavoriteService {
	constructor(
		private readonly favoriteRepository = new DashboardFavoriteRepository(),
	) {}

	async execute(id: string, params: { companyId: string; userId: string }) {
		const row = await this.favoriteRepository.softDelete(
			id,
			params.companyId,
			params.userId,
			params.userId,
		);
		if (!row) throw new AppError(404, "Favorito não encontrado.");
		return row;
	}
}

export class CreateDashboardGoalService {
	constructor(
		private readonly goalRepository = new DashboardGoalRepository(),
	) {}

	async execute(
		input: CreateDashboardGoalInput,
		params: { companyId: string; userId: string },
	) {
		return this.goalRepository.create({
			...input,
			companyId: params.companyId,
			createdBy: params.userId,
		});
	}
}

export class UpdateDashboardGoalService {
	constructor(
		private readonly goalRepository = new DashboardGoalRepository(),
	) {}

	async execute(
		id: string,
		input: UpdateDashboardGoalInput,
		params: { companyId: string; userId: string },
	) {
		const row = await this.goalRepository.update(id, params.companyId, {
			...input,
			updatedBy: params.userId,
		});
		if (!row) throw new AppError(404, "Meta não encontrada.");
		return row;
	}
}

export class SoftDeleteDashboardGoalService {
	constructor(
		private readonly goalRepository = new DashboardGoalRepository(),
	) {}

	async execute(id: string, params: { companyId: string; userId: string }) {
		const row = await this.goalRepository.softDelete(
			id,
			params.companyId,
			params.userId,
		);
		if (!row) throw new AppError(404, "Meta não encontrada.");
		return row;
	}
}
