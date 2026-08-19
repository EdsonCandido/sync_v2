import { apiFetch, apiFetchBlob } from "./api";

export type FinancialCategory = {
	id: string;
	companyId: string;
	name: string;
	tipo: "receita" | "despesa";
	cor: string;
	icone: string;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CostCenter = {
	id: string;
	companyId: string;
	name: string;
	codigo: string;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type BankAccount = {
	id: string;
	companyId: string;
	banco: string;
	agencia: string;
	conta: string;
	tipo: "corrente" | "poupanca" | "investimento" | "outro";
	saldoInicial: number;
	saldoAtual: number;
	dataSaldoInicial: string;
	cor: string;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type Supplier = {
	id: string;
	companyId: string;
	name: string;
	document: string | null;
	email: string | null;
	phone: string | null;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type FinancialEntry = {
	id: string;
	companyId: string;
	kind: "receber" | "pagar";
	originType: "avulsa" | "kanban" | "manual" | "itr";
	originLabel: string | null;
	kanbanCardId: string | null;
	clientId: string | null;
	clientName?: string | null;
	supplierId: string | null;
	supplierName?: string | null;
	categoryId: string | null;
	categoryName?: string | null;
	costCenterId: string | null;
	costCenterName?: string | null;
	bankAccountId: string | null;
	documento: string | null;
	numero: string | null;
	valorOriginal: number;
	desconto: number;
	acrescimo: number;
	juros: number;
	multa: number;
	valorPago: number;
	valorAberto: number;
	dataEmissao: string;
	dataVencimento: string;
	dataLiquidacao: string | null;
	status: "em_aberto" | "parcial" | "pago" | "cancelado" | "vencido";
	observacoes: string | null;
	installmentGroupId: string | null;
	installmentNumber: number | null;
	installmentTotal: number | null;
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
	payments?: Array<{
		id: string;
		valor: number;
		juros: number;
		multa: number;
		desconto: number;
		dataPagamento: string;
		bankAccountId: string | null;
		observacoes: string | null;
		estornado: boolean;
		createdAt: string;
	}>;
	history?: Array<{
		id: string;
		action: string;
		userId: string | null;
		ip: string | null;
		payload: unknown;
		createdAt: string;
	}>;
	attachments?: Array<{
		id: string;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
		uploadedBy: string | null;
		createdAt: string;
	}>;
};

export type FinanceiroDashboard = {
	kpis: {
		saldoAtual: number;
		saldoEmBancos: number;
		contasReceberHoje: number;
		contasPagarHoje: number;
		recebimentosMes: number;
		pagamentosMes: number;
		lucroMes: number;
		receitaBrutaMes: number;
		receitaLiquidaMes: number;
		despesasMes: number;
		margemPercent: number;
		ticketMedio: number;
		inadimplencia: number;
		clientesInadimplentes: number;
		valorEmAberto: number;
		recebimentosHoje: number;
		pagamentosHoje: number;
	};
	bancos: Array<{
		id: string;
		banco: string;
		saldoAtual: number;
		cor: string;
	}>;
	receitasDespesas: Array<{
		month: string;
		receitas: number;
		despesas: number;
	}>;
	evolucaoMensal: Array<{
		month: string;
		receita: number;
		despesa: number;
		lucro: number;
	}>;
	projecaoAnual: Array<{
		month: string;
		receitas: number;
		despesas: number;
	}>;
	porCategoria: Array<{ name: string; cor: string; valor: number }>;
	porCentroCusto: Array<{ name: string; valor: number }>;
	planoContas: Array<{
		name: string;
		tipo: "receita" | "despesa";
		valor: number;
	}>;
	inadimplenciaSplit: { emDia: number; vencido: number };
};

export type FinanceiroReportListItem = {
	slug: string;
	title: string;
};

export type FinanceiroReportParams = {
	from?: string;
	to?: string;
	bankAccountId?: string;
};

export type FinanceiroReport = {
	meta: {
		slug: string;
		title: string;
		from: string;
		to: string;
	};
	kpis: Array<{
		label: string;
		value: number;
		format?: "money" | "number" | "percent";
	}>;
	columns: Array<{
		key: string;
		label: string;
		align?: "left" | "right";
		format?: "text" | "money" | "date" | "number";
	}>;
	rows: Array<Record<string, string | number | null>>;
	series?: Array<{
		date: string;
		entradasRealizadas?: number;
		saidasRealizadas?: number;
		entradasPrevistas?: number;
		saidasPrevistas?: number;
		saldoAcumulado?: number;
		receitas?: number;
		despesas?: number;
	}>;
	aging?: Array<{
		bucket: string;
		quantidade: number;
		valor: number;
	}>;
	bankAccountId?: string;
	bankAccountLabel?: string;
	saldoInicial?: number;
	saldoFinal?: number;
};

export type ListResult<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
};

export type FinancialEntryInput = {
	kind: "receber" | "pagar";
	originType?: "avulsa" | "kanban" | "manual" | "itr";
	originLabel?: string | null;
	kanbanCardId?: string | null;
	clientId?: string | null;
	supplierId?: string | null;
	categoryId?: string | null;
	costCenterId?: string | null;
	bankAccountId?: string | null;
	documento?: string | null;
	numero?: string | null;
	valorOriginal: number;
	desconto?: number;
	acrescimo?: number;
	juros?: number;
	multa?: number;
	dataEmissao: string;
	dataVencimento: string;
	observacoes?: string | null;
	parcelas?: number;
	parcelamentoModo?: "dividir" | "repetir";
};

function qs(params: Record<string, string | number | undefined>) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") search.set(key, String(value));
	}
	const s = search.toString();
	return s ? `?${s}` : "";
}

export const financeiroApi = {
	dashboard: () => apiFetch<FinanceiroDashboard>("/api/financeiro/dashboard"),

	downloadSaudeFinanceiraPdf: async () => {
		const { blob, filename } = await apiFetchBlob(
			"/api/financeiro/relatorios/saude-financeira.pdf",
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download =
			filename ||
			`saude-financeira-${new Date().toISOString().slice(0, 10)}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	},

	listRelatorios: () =>
		apiFetch<{ items: FinanceiroReportListItem[] }>(
			"/api/financeiro/relatorios",
		),

	getRelatorio: (slug: string, params: FinanceiroReportParams = {}) =>
		apiFetch<FinanceiroReport>(
			`/api/financeiro/relatorios/${slug}${qs(params)}`,
		),

	downloadRelatorioPdf: async (
		slug: string,
		params: FinanceiroReportParams = {},
	) => {
		const { blob, filename } = await apiFetchBlob(
			`/api/financeiro/relatorios/${slug}/pdf${qs(params)}`,
		);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download =
			filename || `${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	},

	listCategorias: (
		params: {
			q?: string;
			tipo?: string;
			page?: number;
			pageSize?: number;
		} = {},
	) =>
		apiFetch<ListResult<FinancialCategory>>(
			`/api/financeiro/categorias${qs(params)}`,
		),
	createCategoria: (body: {
		name: string;
		tipo: "receita" | "despesa";
		cor?: string;
		icone?: string;
	}) =>
		apiFetch<FinancialCategory>("/api/financeiro/categorias", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateCategoria: (
		id: string,
		body: Partial<{
			name: string;
			tipo: "receita" | "despesa";
			cor: string;
			icone: string;
		}>,
	) =>
		apiFetch<FinancialCategory>(`/api/financeiro/categorias/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeCategoria: (id: string) =>
		apiFetch<FinancialCategory>(`/api/financeiro/categorias/${id}`, {
			method: "DELETE",
		}),

	listCentros: (
		params: { q?: string; page?: number; pageSize?: number } = {},
	) =>
		apiFetch<ListResult<CostCenter>>(
			`/api/financeiro/centros-de-custo${qs(params)}`,
		),
	createCentro: (body: { name: string; codigo: string }) =>
		apiFetch<CostCenter>("/api/financeiro/centros-de-custo", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateCentro: (id: string, body: Partial<{ name: string; codigo: string }>) =>
		apiFetch<CostCenter>(`/api/financeiro/centros-de-custo/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeCentro: (id: string) =>
		apiFetch<CostCenter>(`/api/financeiro/centros-de-custo/${id}`, {
			method: "DELETE",
		}),

	listBancos: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
		apiFetch<ListResult<BankAccount>>(`/api/financeiro/bancos${qs(params)}`),
	createBanco: (body: {
		banco: string;
		agencia: string;
		conta: string;
		tipo: BankAccount["tipo"];
		saldoInicial: number;
		dataSaldoInicial: string;
		cor?: string;
	}) =>
		apiFetch<BankAccount>("/api/financeiro/bancos", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateBanco: (
		id: string,
		body: Partial<{
			banco: string;
			agencia: string;
			conta: string;
			tipo: BankAccount["tipo"];
			saldoInicial: number;
			dataSaldoInicial: string;
			cor: string;
		}>,
	) =>
		apiFetch<BankAccount>(`/api/financeiro/bancos/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeBanco: (id: string) =>
		apiFetch<BankAccount>(`/api/financeiro/bancos/${id}`, {
			method: "DELETE",
		}),

	listFornecedores: (
		params: { q?: string; page?: number; pageSize?: number } = {},
	) =>
		apiFetch<ListResult<Supplier>>(`/api/financeiro/fornecedores${qs(params)}`),
	createFornecedor: (body: {
		name: string;
		document?: string | null;
		email?: string | null;
		phone?: string | null;
	}) =>
		apiFetch<Supplier>("/api/financeiro/fornecedores", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateFornecedor: (
		id: string,
		body: Partial<{
			name: string;
			document: string | null;
			email: string | null;
			phone: string | null;
		}>,
	) =>
		apiFetch<Supplier>(`/api/financeiro/fornecedores/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeFornecedor: (id: string) =>
		apiFetch<Supplier>(`/api/financeiro/fornecedores/${id}`, {
			method: "DELETE",
		}),

	listLancamentos: (
		params: {
			q?: string;
			kind?: string;
			status?: string;
			from?: string;
			to?: string;
			page?: number;
			pageSize?: number;
		} = {},
	) =>
		apiFetch<ListResult<FinancialEntry>>(
			`/api/financeiro/lancamentos${qs(params)}`,
		),
	getLancamento: (id: string) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}`),
	findLancamento: (id: string) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}`),
	listLancamentosGrupo: (groupId: string) =>
		apiFetch<{ items: FinancialEntry[] }>(
			`/api/financeiro/lancamentos/grupo/${groupId}`,
		),
	createLancamento: (body: FinancialEntryInput) =>
		apiFetch<FinancialEntry | { items: FinancialEntry[] }>(
			"/api/financeiro/lancamentos",
			{ method: "POST", body: JSON.stringify(body) },
		),
	updateLancamento: (id: string, body: Partial<FinancialEntryInput>) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}`, {
			method: "PUT",
			body: JSON.stringify(body),
		}),
	removeLancamento: (id: string) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}`, {
			method: "DELETE",
		}),
	cancelLancamento: (id: string) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}/cancelar`, {
			method: "POST",
		}),
	baixarLancamento: (
		id: string,
		body: {
			valor: number;
			bankAccountId: string;
			dataPagamento: string;
			juros?: number;
			multa?: number;
			desconto?: number;
			observacoes?: string | null;
		},
	) =>
		apiFetch<FinancialEntry>(`/api/financeiro/lancamentos/${id}/baixar`, {
			method: "POST",
			body: JSON.stringify(body),
		}),
	estornarPagamento: (entryId: string, paymentId: string) =>
		apiFetch<FinancialEntry>(
			`/api/financeiro/lancamentos/${entryId}/pagamentos/${paymentId}/estornar`,
			{ method: "POST" },
		),
	renegociar: (
		id: string,
		body: {
			valorTotal: number;
			parcelas: number;
			primeiraDataVencimento: string;
			categoryId?: string | null;
			costCenterId?: string | null;
			bankAccountId?: string | null;
			observacoes?: string | null;
		},
	) =>
		apiFetch<{ items: FinancialEntry[] }>(
			`/api/financeiro/lancamentos/${id}/renegociar`,
			{ method: "POST", body: JSON.stringify(body) },
		),
	uploadAnexo: async (entryId: string, file: File) => {
		const form = new FormData();
		form.append("file", file);
		return apiFetch<{ id: string; originalName: string }>(
			`/api/financeiro/lancamentos/${entryId}/anexos`,
			{ method: "POST", body: form },
		);
	},
	downloadAnexo: (entryId: string, attachmentId: string) =>
		apiFetchBlob(
			`/api/financeiro/lancamentos/${entryId}/anexos/${attachmentId}/download`,
		),
	removeAnexo: (entryId: string, attachmentId: string) =>
		apiFetch(`/api/financeiro/lancamentos/${entryId}/anexos/${attachmentId}`, {
			method: "DELETE",
		}),
};

export function formatMoney(value: number) {
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function formatDate(value: string | Date) {
	if (typeof value === "string") {
		const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
		if (dateOnly) {
			const year = Number(dateOnly[1]);
			const month = Number(dateOnly[2]);
			const day = Number(dateOnly[3]);
			return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
		}
	}
	const d = typeof value === "string" ? new Date(value) : value;
	return d.toLocaleDateString("pt-BR");
}
