import { apiFetch, apiFetchBlob } from "@/lib/api";

export type ItrFileKind = "declaracao" | "recibo" | "anexo";

export type ItrFileMeta = {
	id: string;
	kind: ItrFileKind;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	createdAt: string;
};

export type ItrProcess = {
	id: string;
	companyId: string;
	clientId: string;
	clientName: string;
	clientDocument: string;
	kanbanCardId: string;
	financialEntryId: string;
	valor: number;
	observacoes: string | null;
	columnSlug: string;
	columnName: string;
	files: ItrFileMeta[];
	ativo: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreateItrProcessInput = {
	clientId?: string | null;
	document?: string;
	name?: string;
	email?: string;
	phone?: string;
	valor: number;
	observacoes?: string | null;
	dataVencimento: string;
};

export type UpdateItrProcessInput = {
	observacoes?: string | null;
};

export type ItrClientLookup = {
	id: string;
	document: string;
	name: string;
	email: string;
	phone: string;
};

export type PublicItrConsultItem = {
	id: string;
	clientName: string;
	statusSlug: string;
	statusLabel: string;
	message: string;
	canDownload: boolean;
	files: Array<{
		id: string;
		kind: ItrFileKind;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
	}>;
	createdAt: string;
};

export const ITR_FILE_KIND_LABELS: Record<ItrFileKind, string> = {
	declaracao: "Declaração",
	recibo: "Recibo",
	anexo: "Anexo",
};

export const itrApi = {
	list: (params?: { q?: string; page?: number; pageSize?: number }) => {
		const sp = new URLSearchParams();
		if (params?.q) sp.set("q", params.q);
		if (params?.page) sp.set("page", String(params.page));
		if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
		const qs = sp.toString();
		return apiFetch<{
			items: ItrProcess[];
			total: number;
			page: number;
			pageSize: number;
		}>(`/api/itr${qs ? `?${qs}` : ""}`);
	},

	find: (id: string) => apiFetch<ItrProcess>(`/api/itr/${id}`),

	lookupClientByDocument: (document: string) =>
		apiFetch<{ client: ItrClientLookup | null }>(
			`/api/itr/clients/by-document/${encodeURIComponent(document.replace(/\D/g, ""))}`,
		),

	create: (
		input: CreateItrProcessInput,
		files: {
			declaracao: File | null;
			recibo: File | null;
			anexos: File[];
		},
	) => {
		const form = new FormData();
		for (const [key, value] of Object.entries(input)) {
			if (value === undefined || value === null) continue;
			form.append(key, String(value));
		}
		if (files.declaracao) form.append("declaracao", files.declaracao);
		if (files.recibo) form.append("recibo", files.recibo);
		for (const file of files.anexos) {
			form.append("anexos", file);
		}
		return apiFetch<ItrProcess>("/api/itr", {
			method: "POST",
			body: form,
		});
	},

	update: (id: string, body: UpdateItrProcessInput) =>
		apiFetch<ItrProcess>(`/api/itr/${id}`, {
			method: "PATCH",
			body: JSON.stringify(body),
		}),

	remove: (id: string) =>
		apiFetch<{ ok: boolean }>(`/api/itr/${id}`, { method: "DELETE" }),

	uploadFile: (
		processId: string,
		file: File,
		kind: ItrFileKind = "anexo",
	) => {
		const form = new FormData();
		form.append("file", file);
		form.append("kind", kind);
		return apiFetch<ItrFileMeta>(`/api/itr/${processId}/files`, {
			method: "POST",
			body: form,
		});
	},

	removeFile: (processId: string, fileId: string) =>
		apiFetch<{ ok: boolean }>(`/api/itr/${processId}/files/${fileId}`, {
			method: "DELETE",
		}),

	downloadFile: (processId: string, fileId: string) =>
		apiFetchBlob(`/api/itr/${processId}/files/${fileId}`),

	publicConsult: (cpf: string) => {
		const sp = new URLSearchParams({ cpf });
		return apiFetch<{ items: PublicItrConsultItem[] }>(
			`/api/public/itr/consultar?${sp.toString()}`,
		);
	},

	publicDownload: (fileId: string, cpf: string) => {
		const sp = new URLSearchParams({ cpf });
		return apiFetchBlob(`/api/public/itr/files/${fileId}?${sp.toString()}`);
	},
};
