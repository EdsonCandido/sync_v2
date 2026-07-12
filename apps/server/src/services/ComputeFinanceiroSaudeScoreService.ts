import type {
	FinanceiroDashboardResponse,
	FinanceiroSaudeScore,
} from "@sync_v2/contracts";

type ScoreInput = {
	kpis: FinanceiroDashboardResponse["kpis"];
	inadimplenciaSplit: FinanceiroDashboardResponse["inadimplenciaSplit"];
	openReceber: number;
	openPagar: number;
};

function clamp(value: number, min = 0, max = 100) {
	return Math.max(min, Math.min(max, value));
}

function labelFor(score: number): FinanceiroSaudeScore["label"] {
	if (score >= 80) return "Excelente";
	if (score >= 60) return "Bom";
	if (score >= 40) return "Atenção";
	return "Crítico";
}

/**
 * Score composto 0–100.
 * Pesos: liquidez 25%, rentabilidade 25%, fluxo 20%, inadimplência 20%, cobertura 10%.
 */
export class ComputeFinanceiroSaudeScoreService {
	execute(input: ScoreInput): FinanceiroSaudeScore {
		const { kpis, openReceber, openPagar } = input;

		const pagarPressao = kpis.contasPagarHoje + openPagar;
		const liquidezRaw =
			pagarPressao <= 0
				? kpis.saldoEmBancos >= 0
					? 100
					: 40
				: (kpis.saldoEmBancos / pagarPressao) * 70;
		const liquidez = clamp(liquidezRaw);

		const margemScore = clamp(50 + kpis.margemPercent);
		const lucroBonus = kpis.lucroMes > 0 ? 15 : kpis.lucroMes < 0 ? -20 : 0;
		const rentabilidade = clamp(margemScore + lucroBonus);

		const fluxoRatio = kpis.recebimentosMes / Math.max(kpis.pagamentosMes, 1);
		const fluxo = clamp(fluxoRatio * 70);

		const inadRatio = kpis.inadimplencia / Math.max(kpis.receitaLiquidaMes, 1);
		const inadimplencia = clamp(100 - inadRatio * 200);

		const cobertura =
			openPagar <= 0
				? openReceber >= 0
					? 100
					: 50
				: clamp((openReceber / openPagar) * 80);

		const dimensions: FinanceiroSaudeScore["dimensions"] = [
			{ key: "liquidez", label: "Liquidez", score: liquidez, weight: 0.25 },
			{
				key: "rentabilidade",
				label: "Rentabilidade",
				score: rentabilidade,
				weight: 0.25,
			},
			{ key: "fluxo", label: "Fluxo", score: fluxo, weight: 0.2 },
			{
				key: "inadimplencia",
				label: "Inadimplência",
				score: inadimplencia,
				weight: 0.2,
			},
			{
				key: "cobertura",
				label: "Cobertura AR/AP",
				score: cobertura,
				weight: 0.1,
			},
		];

		const score = clamp(
			dimensions.reduce((sum, d) => sum + d.score * d.weight, 0),
		);

		return {
			score: Math.round(score * 10) / 10,
			label: labelFor(score),
			dimensions: dimensions.map((d) => ({
				...d,
				score: Math.round(d.score * 10) / 10,
			})),
		};
	}
}
