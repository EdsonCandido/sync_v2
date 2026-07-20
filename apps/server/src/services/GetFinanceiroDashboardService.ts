import { BankAccountRepository } from "../repositories/BankAccountRepository";
import { FinancialEntryRepository } from "../repositories/FinancialEntryRepository";

export class GetFinanceiroDashboardService {
	constructor(
		private readonly entryRepository = new FinancialEntryRepository(),
		private readonly bankRepository = new BankAccountRepository(),
	) {}

	async execute(companyId: string) {
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		const today = new Date();

		const [
			saldoEmBancos,
			bancos,
			contasReceberHoje,
			contasPagarHoje,
			recebimentosMes,
			pagamentosMes,
			recebimentosHoje,
			pagamentosHoje,
			inadimplencia,
			emDia,
			clientesInadimplentes,
			valorEmAberto,
			receitasDespesas,
			porCategoria,
			porCentroCusto,
			planoContas,
			projecaoAnual,
		] = await Promise.all([
			this.bankRepository.sumSaldoAtual(companyId),
			this.bankRepository.listAllActive(companyId),
			this.entryRepository.sumOpenDueOn(companyId, "receber", today),
			this.entryRepository.sumOpenDueOn(companyId, "pagar", today),
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"receber",
				monthStart,
				monthEnd,
			),
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"pagar",
				monthStart,
				monthEnd,
			),
			this.entryRepository.sumPaymentsInRange(
				companyId,
				"receber",
				today,
				today,
			),
			this.entryRepository.sumPaymentsInRange(companyId, "pagar", today, today),
			this.entryRepository.sumOpenOverdue(companyId, "receber"),
			this.entryRepository.sumOpenOnTime(companyId, "receber"),
			this.entryRepository.countDistinctOverdueClients(companyId),
			this.entryRepository.sumValorAberto(companyId),
			this.entryRepository.yearlyPaymentSeries(companyId, now.getFullYear()),
			this.entryRepository.groupOpenByCategory(companyId),
			this.entryRepository.groupOpenByCostCenter(companyId),
			this.entryRepository.groupByPlanoContas(companyId),
			this.entryRepository.yearlyProjectionByDueDate(
				companyId,
				now.getFullYear(),
			),
		]);

		const receitaBrutaMes = recebimentosMes.total;
		const receitaLiquidaMes =
			recebimentosMes.total -
			recebimentosMes.descontos +
			recebimentosMes.acrescimos;
		const despesasMes = pagamentosMes.total;
		const lucroMes = recebimentosMes.total - pagamentosMes.total;
		const margemPercent =
			receitaBrutaMes > 0 ? (lucroMes / receitaBrutaMes) * 100 : 0;
		const ticketMedio =
			recebimentosMes.count > 0 ? receitaLiquidaMes / recebimentosMes.count : 0;

		const evolucaoMensal = receitasDespesas.map((row) => ({
			month: row.month,
			receita: row.receitas,
			despesa: row.despesas,
			lucro: row.receitas - row.despesas,
		}));

		return {
			kpis: {
				saldoAtual: saldoEmBancos,
				saldoEmBancos,
				contasReceberHoje,
				contasPagarHoje,
				recebimentosMes: recebimentosMes.total,
				pagamentosMes: pagamentosMes.total,
				lucroMes,
				receitaBrutaMes,
				receitaLiquidaMes,
				despesasMes,
				margemPercent: Math.round(margemPercent * 10) / 10,
				ticketMedio: Math.round(ticketMedio * 100) / 100,
				inadimplencia,
				clientesInadimplentes,
				valorEmAberto,
				recebimentosHoje: recebimentosHoje.total,
				pagamentosHoje: pagamentosHoje.total,
			},
			bancos: bancos.map((b) => ({
				id: b.id,
				banco: b.banco,
				saldoAtual: b.saldoAtual,
				cor: b.cor,
			})),
			receitasDespesas,
			evolucaoMensal,
			projecaoAnual,
			porCategoria,
			porCentroCusto,
			planoContas,
			inadimplenciaSplit: {
				emDia,
				vencido: inadimplencia,
			},
		};
	}
}
