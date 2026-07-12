import type { CompanyDashboardResponse } from "@sync_v2/contracts";
import { AccessEventRepository } from "../repositories/AccessEventRepository";
import { CompanyActivityRepository } from "../repositories/CompanyActivityRepository";
import { CompanyContractRepository } from "../repositories/CompanyContractRepository";
import { CompanyPaymentRepository } from "../repositories/CompanyPaymentRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { CompanyRequestRepository } from "../repositories/CompanyRequestRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../utils/AppError";

const DEPARTMENT_COLORS = [
	"helios.solid",
	"blue.solid",
	"green.solid",
	"orange.solid",
	"purple.solid",
	"pink.solid",
	"cyan.solid",
];

export class GetCompanyDashboardService {
	constructor(
		private readonly companyRepository = new CompanyRepository(),
		private readonly userRepository = new UserRepository(),
		private readonly accessEventRepository = new AccessEventRepository(),
		private readonly requestRepository = new CompanyRequestRepository(),
		private readonly activityRepository = new CompanyActivityRepository(),
		private readonly contractRepository = new CompanyContractRepository(),
		private readonly paymentRepository = new CompanyPaymentRepository(),
	) {}

	async execute(companyId: string): Promise<CompanyDashboardResponse> {
		const withPlan = await this.companyRepository.findWithPlan(companyId);
		if (!withPlan) {
			throw new AppError(404, "Empresa não encontrada.");
		}

		const { company, planName } = withPlan;
		const now = new Date();

		const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

		const usageFrom = new Date(now);
		usageFrom.setDate(usageFrom.getDate() - 29);
		usageFrom.setHours(0, 0, 0, 0);

		const prevUsageFrom = new Date(usageFrom);
		prevUsageFrom.setDate(prevUsageFrom.getDate() - 30);
		const prevUsageTo = new Date(usageFrom.getTime() - 1);

		const [
			activeUsers,
			registeredUsers,
			pendingRequests,
			createdThisMonth,
			createdLastMonth,
			usageRows,
			currentPeriodAccesses,
			previousPeriodAccesses,
			departments,
			activities,
			pendingRequestItems,
			expiringContracts,
			pendingPayments,
			blockedUsers,
			inactiveUsers,
			inactiveOver15,
		] = await Promise.all([
			this.userRepository.countActive(companyId),
			this.userRepository.countRegistered(companyId),
			this.requestRepository.countPending(companyId),
			this.userRepository.countCreatedBetween(companyId, startOfThisMonth, now),
			this.userRepository.countCreatedBetween(
				companyId,
				startOfLastMonth,
				endOfLastMonth,
			),
			this.accessEventRepository.dailyCounts(companyId, usageFrom),
			this.accessEventRepository.countBetween(companyId, usageFrom, now),
			this.accessEventRepository.countBetween(
				companyId,
				prevUsageFrom,
				prevUsageTo,
			),
			this.userRepository.departmentDistribution(companyId),
			this.activityRepository.listRecent(companyId, 12),
			this.requestRepository.listPending(companyId, 5),
			this.contractRepository.listExpiringSoon(companyId, 30, 5),
			this.paymentRepository.listPending(companyId, 5),
			this.userRepository.listBlocked(companyId, 5),
			this.userRepository.listInactiveOverDays(companyId, 30, 5),
			this.userRepository.countInactiveOverDays(companyId, 15),
		]);

		const daysToExpiry = Math.ceil(
			(company.planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);

		const growthDelta = percentDelta(createdThisMonth, createdLastMonth);
		const usageDelta = percentDelta(
			currentPeriodAccesses,
			previousPeriodAccesses,
		);

		const usageByDate = new Map(
			usageRows.map((row) => [row.date, Number(row.accesses)]),
		);
		const usageTrend = Array.from({ length: 30 }, (_, index) => {
			const date = new Date(usageFrom);
			date.setDate(usageFrom.getDate() + index);
			const key = toDateKey(date);
			return {
				date: key,
				accesses: usageByDate.get(key) ?? 0,
			};
		});

		const topDepartment = [...departments].sort(
			(a, b) => Number(b.count) - Number(a.count),
		)[0];

		const kpis: CompanyDashboardResponse["kpis"] = [
			{
				id: "active_users",
				label: "Usuários ativos",
				value: activeUsers,
				description: "Com acesso nos últimos 30 dias",
				deltaPercent: usageDelta,
				trend: trendFromDelta(usageDelta),
			},
			{
				id: "registered_users",
				label: "Usuários cadastrados",
				value: registeredUsers,
				description: "Total ativo na empresa",
				deltaPercent: growthDelta,
				trend: trendFromDelta(growthDelta),
			},
			{
				id: "pending_requests",
				label: "Solicitações pendentes",
				value: pendingRequests,
				description: "Aguardando aprovação",
				deltaPercent: null,
				trend: pendingRequests > 0 ? "down" : "neutral",
			},
			{
				id: "plan",
				label: "Plano contratado",
				value: planName,
				description: "Plano atual da empresa",
				deltaPercent: null,
				trend: "neutral",
			},
			{
				id: "days_to_expiry",
				label: "Dias para vencimento",
				value: Math.max(daysToExpiry, 0),
				description: "Até o fim da assinatura",
				deltaPercent: null,
				trend: daysToExpiry <= 15 ? "down" : "neutral",
			},
			{
				id: "growth",
				label: "Crescimento",
				value: `${growthDelta >= 0 ? "+" : ""}${growthDelta}%`,
				description: "Novos usuários vs mês anterior",
				deltaPercent: growthDelta,
				trend: trendFromDelta(growthDelta),
			},
		];

		const departmentDistribution = departments.map((row, index) => ({
			department: row.department,
			count: Number(row.count),
			color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]!,
		}));

		const pendencies: CompanyDashboardResponse["pendencies"] = [
			...pendingRequestItems.map((item) => ({
				id: `request-${item.id}`,
				kind: "pending_request" as const,
				title: item.title,
				description: "Solicitação aguardando aprovação",
				priority: "high" as const,
			})),
			...expiringContracts.map((item) => ({
				id: `contract-${item.id}`,
				kind: "expiring_contract" as const,
				title: item.title,
				description: `Vence em ${formatDate(item.expiresAt)}`,
				priority: "high" as const,
			})),
			...pendingPayments.map((item) => ({
				id: `payment-${item.id}`,
				kind: "pending_payment" as const,
				title: item.description,
				description: `R$ ${item.amount.toFixed(2)} · venc. ${formatDate(item.dueDate)}`,
				priority: "medium" as const,
			})),
			...blockedUsers.map((item) => ({
				id: `blocked-${item.id}`,
				kind: "blocked_user" as const,
				title: item.name,
				description: "Usuário bloqueado",
				priority: "medium" as const,
			})),
			...inactiveUsers.map((item) => ({
				id: `inactive-${item.id}`,
				kind: "inactive_user" as const,
				title: item.name,
				description: "Sem acesso há mais de 30 dias",
				priority: "low" as const,
			})),
		];

		const insights: CompanyDashboardResponse["insights"] = [];

		if (usageDelta !== 0) {
			insights.push({
				id: "usage-growth",
				message: `A utilização ${usageDelta >= 0 ? "aumentou" : "diminuiu"} ${Math.abs(usageDelta)}%.`,
				tone: usageDelta >= 0 ? "positive" : "warning",
			});
		}

		if (topDepartment && Number(topDepartment.count) > 0) {
			insights.push({
				id: "top-department",
				message: `O ${topDepartment.department} é o setor mais ativo.`,
				tone: "info",
			});
		}

		if (inactiveOver15 > 0) {
			insights.push({
				id: "inactive-15",
				message: `Existem ${inactiveOver15} usuários sem acessar há mais de 15 dias.`,
				tone: "warning",
			});
		}

		if (daysToExpiry <= 30) {
			insights.push({
				id: "plan-expiry",
				message: `O plano vence em ${Math.max(daysToExpiry, 0)} dias.`,
				tone: daysToExpiry <= 8 ? "warning" : "neutral",
			});
		}

		if (pendingRequests > 0) {
			insights.push({
				id: "pending-requests",
				message: `Há ${pendingRequests} solicitações aguardando aprovação.`,
				tone: "info",
			});
		}

		return {
			kpis,
			usageTrend,
			departmentDistribution,
			recentActivities: activities.map((item) => ({
				id: item.id,
				userName: item.userName,
				action: item.action,
				occurredAt: item.occurredAt,
			})),
			pendencies,
			insights,
			planName,
			planExpiresAt: company.planExpiresAt,
		};
	}
}

function percentDelta(current: number, previous: number) {
	if (previous === 0) {
		return current === 0 ? 0 : 100;
	}
	return Math.round(((current - previous) / previous) * 100);
}

function trendFromDelta(delta: number): "up" | "down" | "neutral" {
	if (delta > 0) return "up";
	if (delta < 0) return "down";
	return "neutral";
}

function toDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function formatDate(date: Date) {
	return date.toLocaleDateString("pt-BR");
}
