import type {
	FinanceiroDashboardResponse,
	FinanceiroSaudeAnalysis,
	FinanceiroSaudeInsight,
	FinanceiroSaudeScore,
} from "@sync_v2/contracts";
import { money } from "./financeiroReportShared";

type AnalysisInput = {
	kpis: FinanceiroDashboardResponse["kpis"];
	porCategoria: FinanceiroDashboardResponse["porCategoria"];
	evolucaoMensal: FinanceiroDashboardResponse["evolucaoMensal"];
	score: FinanceiroSaudeScore;
	openReceber: number;
	openPagar: number;
	receberCount: number;
	pagarCount: number;
};

function insight(
	id: string,
	title: string,
	message: string,
	tone: FinanceiroSaudeInsight["tone"],
): FinanceiroSaudeInsight {
	return { id, title, message, tone };
}

export class BuildFinanceiroSaudeAnalysisService {
	execute(input: AnalysisInput): FinanceiroSaudeAnalysis {
		const {
			kpis,
			porCategoria,
			evolucaoMensal,
			score,
			openReceber,
			openPagar,
			receberCount,
			pagarCount,
		} = input;

		const pontosFortes: FinanceiroSaudeInsight[] = [];
		const oportunidades: FinanceiroSaudeInsight[] = [];
		const riscos: FinanceiroSaudeInsight[] = [];
		const sugestoes: FinanceiroSaudeInsight[] = [];
		const checklist: string[] = [];
		const proximasAcoes: string[] = [];

		if (kpis.margemPercent >= 20 && kpis.lucroMes > 0) {
			pontosFortes.push(
				insight(
					"margem-alta",
					"Margem saudável",
					`Margem de ${kpis.margemPercent}% com lucro de ${money(kpis.lucroMes)} no mês.`,
					"positive",
				),
			);
		}

		if (kpis.saldoEmBancos > openPagar && openPagar > 0) {
			pontosFortes.push(
				insight(
					"caixa-cobre-pagar",
					"Caixa cobre obrigações",
					`Saldo em bancos (${money(kpis.saldoEmBancos)}) supera contas a pagar em aberto.`,
					"positive",
				),
			);
		}

		const dimFluxo = score.dimensions.find((d) => d.key === "fluxo");
		if (dimFluxo && dimFluxo.score >= 70) {
			pontosFortes.push(
				insight(
					"fluxo-positivo",
					"Fluxo equilibrado",
					"Recebimentos do mês acompanham ou superam os pagamentos.",
					"positive",
				),
			);
		}

		if (kpis.inadimplencia <= 0 && kpis.clientesInadimplentes === 0) {
			pontosFortes.push(
				insight(
					"sem-inadimplencia",
					"Sem inadimplência",
					"Não há títulos a receber vencidos em aberto.",
					"positive",
				),
			);
		}

		if (kpis.inadimplencia > 0) {
			riscos.push(
				insight(
					"inadimplencia",
					"Inadimplência ativa",
					`${money(kpis.inadimplencia)} em atraso (${kpis.clientesInadimplentes} cliente(s)).`,
					"critical",
				),
			);
			sugestoes.push(
				insight(
					"cobranca",
					"Acelerar cobrança",
					"Priorize contato com clientes vencidos e renegocie títulos críticos.",
					"warning",
				),
			);
			checklist.push("Revisar carteira de títulos vencidos a receber");
			proximasAcoes.push(
				`Cobrar ${money(kpis.inadimplencia)} em inadimplência (${kpis.clientesInadimplentes} clientes)`,
			);
		}

		if (kpis.lucroMes < 0 || kpis.margemPercent < 5) {
			riscos.push(
				insight(
					"margem-baixa",
					"Rentabilidade sob pressão",
					`Lucro ${money(kpis.lucroMes)} e margem ${kpis.margemPercent}%.`,
					"warning",
				),
			);
			sugestoes.push(
				insight(
					"cortar-despesas",
					"Revisar despesas",
					"Analise categorias de maior peso e renegocie contratos recorrentes.",
					"info",
				),
			);
			checklist.push("Mapear top categorias de despesa do mês");
			proximasAcoes.push("Definir meta de margem mínima para o próximo mês");
		}

		if (kpis.recebimentosMes < kpis.pagamentosMes) {
			riscos.push(
				insight(
					"fluxo-negativo",
					"Fluxo do mês negativo",
					`Pagamentos (${money(kpis.pagamentosMes)}) acima dos recebimentos (${money(kpis.recebimentosMes)}).`,
					"critical",
				),
			);
			sugestoes.push(
				insight(
					"adiar-pagamentos",
					"Priorizar caixa",
					"Negocie prazos de pagamento e antecipe recebíveis estratégicos.",
					"warning",
				),
			);
			proximasAcoes.push("Simular fluxo de caixa dos próximos 15 dias");
		}

		if (openPagar > openReceber * 1.2 && openPagar > 0) {
			riscos.push(
				insight(
					"cobertura-ap",
					"AP acima do AR",
					`A pagar (${money(openPagar)}) supera a receber (${money(openReceber)}).`,
					"warning",
				),
			);
			checklist.push("Conferir vencimentos a pagar da próxima semana");
		}

		if (kpis.contasPagarHoje > kpis.saldoEmBancos && kpis.contasPagarHoje > 0) {
			riscos.push(
				insight(
					"pagar-hoje",
					"Pressão de caixa hoje",
					`Contas a pagar hoje (${money(kpis.contasPagarHoje)}) acima do saldo em bancos.`,
					"critical",
				),
			);
			proximasAcoes.push("Garantir liquidez para pagamentos do dia");
		}

		const totalCat = porCategoria.reduce((s, c) => s + c.valor, 0);
		const topCat = [...porCategoria].sort((a, b) => b.valor - a.valor)[0];
		if (topCat && totalCat > 0 && topCat.valor / totalCat >= 0.4) {
			oportunidades.push(
				insight(
					"concentracao-categoria",
					"Concentração por categoria",
					`${topCat.name} representa ${Math.round((topCat.valor / totalCat) * 100)}% do volume categorizado.`,
					"info",
				),
			);
			sugestoes.push(
				insight(
					"diversificar",
					"Diversificar mix",
					"Avalie se a concentração em uma categoria gera risco operacional ou de margem.",
					"info",
				),
			);
		}

		if (evolucaoMensal.length >= 3) {
			const last3 = evolucaoMensal.slice(-3);
			const growing = last3.every(
				(m, i) => i === 0 || m.receita >= (last3[i - 1]?.receita ?? 0),
			);
			if (growing && (last3[2]?.receita ?? 0) > 0) {
				pontosFortes.push(
					insight(
						"receita-crescente",
						"Receita em tendência de alta",
						"Últimos 3 meses com receita estável ou crescente.",
						"positive",
					),
				);
			}
			const lucroCaindo = last3.every(
				(m, i) => i === 0 || m.lucro <= (last3[i - 1]?.lucro ?? 0),
			);
			if (lucroCaindo && last3.some((m) => m.lucro < 0)) {
				oportunidades.push(
					insight(
						"lucro-declinio",
						"Lucro em declínio",
						"Há espaço para reverter a tendência com ajuste de preços ou custos.",
						"warning",
					),
				);
			}
		}

		if (receberCount > 0 && kpis.contasReceberHoje > 0) {
			oportunidades.push(
				insight(
					"receber-hoje",
					"Recebíveis do dia",
					`${money(kpis.contasReceberHoje)} previstos para hoje — confirme baixas.`,
					"info",
				),
			);
			checklist.push("Confirmar recebimentos previstos para hoje");
		}

		if (pagarCount > 0) {
			checklist.push(`Revisar ${pagarCount} título(s) a pagar em aberto`);
		}

		if (score.score >= 80) {
			oportunidades.push(
				insight(
					"investir-excedente",
					"Excedente de saúde",
					"Com score elevado, considere aplicar excedente ou antecipar passivos caros.",
					"positive",
				),
			);
		} else if (score.score < 40) {
			sugestoes.push(
				insight(
					"plano-recuperacao",
					"Plano de recuperação",
					"Monte um plano semanal de caixa: cortes, cobrança e renegociação.",
					"critical",
				),
			);
			proximasAcoes.push("Agendar reunião de revisão financeira semanal");
		}

		if (pontosFortes.length === 0) {
			pontosFortes.push(
				insight(
					"baseline",
					"Base operacional ativa",
					"Há movimento financeiro suficiente para acompanhamento contínuo.",
					"neutral",
				),
			);
		}
		if (oportunidades.length === 0) {
			oportunidades.push(
				insight(
					"monitorar",
					"Monitorar indicadores",
					"Mantenha acompanhamento semanal de margem, fluxo e inadimplência.",
					"info",
				),
			);
		}
		if (riscos.length === 0) {
			riscos.push(
				insight(
					"risco-controlado",
					"Riscos sob controle",
					"Nenhum alerta crítico automático no período analisado.",
					"positive",
				),
			);
		}
		if (sugestoes.length === 0) {
			sugestoes.push(
				insight(
					"manter-disciplina",
					"Manter disciplina",
					"Preserve rotina de conciliação bancária e baixa de títulos.",
					"info",
				),
			);
		}

		if (checklist.length === 0) {
			checklist.push("Conciliação bancária do mês");
			checklist.push("Revisão de títulos em aberto");
		}
		if (proximasAcoes.length === 0) {
			proximasAcoes.push("Atualizar projeção de caixa dos próximos 30 dias");
		}

		return {
			pontosFortes: pontosFortes.slice(0, 5),
			oportunidades: oportunidades.slice(0, 5),
			riscos: riscos.slice(0, 5),
			sugestoes: sugestoes.slice(0, 5),
			checklist: checklist.slice(0, 5),
			proximasAcoes: proximasAcoes.slice(0, 5),
		};
	}
}
