import { Navigate, useParams } from "react-router";

import { FinanceiroReportPage } from "@/components/financeiro/FinanceiroReportPage";

const VALID = new Set([
	"geral",
	"fluxo-caixa",
	"receitas-periodo",
	"despesas-periodo",
	"receitas-cliente",
	"despesas-categoria",
	"centro-custo",
	"inadimplencia",
	"clientes-devedores",
	"pagamentos-banco",
	"recebimentos-banco",
	"extrato",
]);

export default function DashboardFinanceiroRelatorioSlug() {
	const { slug } = useParams();
	if (!slug || !VALID.has(slug)) {
		return <Navigate to="/dashboard/financeiro/relatorios" replace />;
	}
	return <FinanceiroReportPage slug={slug} />;
}
