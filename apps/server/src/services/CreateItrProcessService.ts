import type { CreateItrProcessInput } from "@sync_v2/contracts";
import type { ItrFileKind } from "@sync_v2/types";
import { ClientRepository } from "../repositories/ClientRepository";
import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { KanbanCardRepository } from "../repositories/KanbanCardRepository";
import { KanbanHistoryRepository } from "../repositories/KanbanHistoryRepository";
import { AppError } from "../utils/AppError";
import { CreateClientService } from "./CreateClientService";
import { CreateFinancialEntryService } from "./CreateFinancialEntryService";
import { EnsureItrKanbanBoardService } from "./EnsureItrKanbanBoardService";
import { FindItrProcessService } from "./FindItrProcessService";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ANEXOS = 18;
const MAX_FILES = 20;

const ALLOWED_MIME_TYPES = new Set([
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"text/plain",
	"text/csv",
	"application/csv",
	"application/zip",
	"application/x-zip-compressed",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export type ItrUploadFile = {
	originalname: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
};

export type CreateItrFilesInput = {
	declaracao?: ItrUploadFile | null;
	recibo?: ItrUploadFile | null;
	anexos: ItrUploadFile[];
};

export class CreateItrProcessService {
	constructor(
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
		private readonly clientRepository = new ClientRepository(),
		private readonly createClientService = new CreateClientService(),
		private readonly ensureItrBoard = new EnsureItrKanbanBoardService(),
		private readonly cardRepository = new KanbanCardRepository(),
		private readonly historyRepository = new KanbanHistoryRepository(),
		private readonly createFinancialEntry = new CreateFinancialEntryService(),
		private readonly findItrProcess = new FindItrProcessService(),
	) {}

	async execute(
		input: CreateItrProcessInput,
		files: CreateItrFilesInput,
		params: { companyId: string; userId: string },
	) {
		if (files.anexos.length > MAX_ANEXOS) {
			throw new AppError(400, `Máximo de ${MAX_ANEXOS} anexos extras.`);
		}
		const allFiles = [
			...(files.declaracao ? [files.declaracao] : []),
			...(files.recibo ? [files.recibo] : []),
			...files.anexos,
		];
		if (allFiles.length > MAX_FILES) {
			throw new AppError(400, `Máximo de ${MAX_FILES} arquivos por processo.`);
		}
		for (const file of allFiles) {
			validateUploadFile(file);
		}

		const client = await this.resolveClient(input, params);
		if (!client) {
			throw new AppError(500, "Falha ao resolver cliente.");
		}
		const { aFazerColumn } = await this.ensureItrBoard.execute(
			params.companyId,
			params.userId,
		);

		const position = await this.cardRepository.nextPosition(aFazerColumn.id);
		const title = `ITR — ${client.name} (${client.document})`;
		const card = await this.cardRepository.create({
			companyId: params.companyId,
			columnId: aFazerColumn.id,
			title,
			description: input.observacoes?.trim() || null,
			clientId: client.id,
			dueAt: null,
			position,
			createdBy: params.userId,
		});
		if (!card) {
			throw new AppError(500, "Falha ao criar card ITR.");
		}

		await this.cardRepository.insertAssignee(card.id, params.userId);
		await this.historyRepository.create({
			cardId: card.id,
			userId: params.userId,
			eventType: "created",
			message: `Card ITR "${card.title}" criado.`,
		});

		const now = new Date();
		const vencimento = input.dataVencimento ?? now;

		const entry = await this.createFinancialEntry.execute(
			{
				kind: "receber",
				originType: "itr",
				originLabel: "ITR",
				kanbanCardId: card.id,
				clientId: client.id,
				valorOriginal: input.valor,
				desconto: 0,
				acrescimo: 0,
				juros: 0,
				multa: 0,
				dataEmissao: now,
				dataVencimento: vencimento,
				observacoes: input.observacoes?.trim() || `ITR — ${client.document}`,
			},
			{ companyId: params.companyId, userId: params.userId },
		);

		const entryId =
			entry &&
			typeof entry === "object" &&
			"id" in entry &&
			typeof (entry as { id: unknown }).id === "string"
				? (entry as { id: string }).id
				: null;

		if (!entryId) {
			throw new AppError(500, "Falha ao criar lançamento financeiro ITR.");
		}

		const process = await this.processRepository.create({
			companyId: params.companyId,
			clientId: client.id,
			kanbanCardId: card.id,
			financialEntryId: entryId,
			valor: input.valor,
			observacoes: input.observacoes?.trim() || null,
			createdBy: params.userId,
			updatedBy: params.userId,
		});
		if (!process) {
			throw new AppError(500, "Falha ao criar processo ITR.");
		}

		const toSave: Array<{ file: ItrUploadFile; kind: ItrFileKind }> = [
			...(files.declaracao
				? [{ file: files.declaracao, kind: "declaracao" as const }]
				: []),
			...(files.recibo
				? [{ file: files.recibo, kind: "recibo" as const }]
				: []),
			...files.anexos.map((file) => ({ file, kind: "anexo" as const })),
		];

		for (const item of toSave) {
			await this.fileRepository.create({
				processId: process.id,
				kind: item.kind,
				originalName: sanitizeFileName(item.file.originalname),
				mimeType: item.file.mimetype || "application/octet-stream",
				sizeBytes: item.file.size,
				content: item.file.buffer,
				uploadedBy: params.userId,
			});
		}

		return this.findItrProcess.execute(process.id, params.companyId);
	}

	private async resolveClient(
		input: CreateItrProcessInput,
		params: { companyId: string; userId: string },
	) {
		if (input.clientId) {
			const existing = await this.clientRepository.findById(
				input.clientId,
				params.companyId,
			);
			if (!existing) {
				throw new AppError(400, "Cliente inválido.");
			}
			return existing;
		}

		const documentRaw = input.document?.trim();
		if (!documentRaw) {
			throw new AppError(400, "CPF obrigatório.");
		}
		const document = normalizeDocument(documentRaw);
		if (document.length !== 11) {
			throw new AppError(400, "CPF deve ter 11 dígitos.");
		}
		const byDoc = await this.clientRepository.findByDocument(
			params.companyId,
			document,
		);
		if (byDoc) {
			return byDoc;
		}

		const name = input.name?.trim();
		const email = input.email?.trim().toLowerCase();
		const phoneRaw = input.phone?.trim();
		if (!name || !email || !phoneRaw) {
			throw new AppError(400, "Dados do cliente incompletos.");
		}
		const phone = phoneRaw.replace(/\D/g, "");
		if (phone.length < 10 || phone.length > 11) {
			throw new AppError(400, "Telefone deve ter 10 ou 11 dígitos.");
		}

		return this.createClientService.execute(
			{
				personType: "PF",
				document,
				name,
				email,
				phone,
				zipCode: ITR_CLIENT_ADDRESS_PLACEHOLDER.zipCode,
				street: ITR_CLIENT_ADDRESS_PLACEHOLDER.street,
				number: ITR_CLIENT_ADDRESS_PLACEHOLDER.number,
				complement: null,
				district: ITR_CLIENT_ADDRESS_PLACEHOLDER.district,
				city: ITR_CLIENT_ADDRESS_PLACEHOLDER.city,
				state: ITR_CLIENT_ADDRESS_PLACEHOLDER.state,
			},
			params,
		);
	}
}

/** Endereço placeholder: clients exige NOT NULL; ITR não coleta endereço. */
const ITR_CLIENT_ADDRESS_PLACEHOLDER = {
	zipCode: "00000000",
	street: "Não informado",
	number: "S/N",
	district: "Não informado",
	city: "Não informado",
	state: "NI",
} as const;

function normalizeDocument(document: string) {
	return document.replace(/\D/g, "");
}

function sanitizeFileName(name: string) {
	const trimmed = name.trim().replace(/[/\\]/g, "_");
	if (!trimmed) return "arquivo";
	return trimmed.slice(0, 255);
}

function validateUploadFile(file: ItrUploadFile) {
	if (!file?.buffer?.length) {
		throw new AppError(400, "Arquivo obrigatório.");
	}
	if (file.size > MAX_FILE_BYTES) {
		throw new AppError(400, "Arquivo excede o limite de 10 MB.");
	}
	const mimeType = file.mimetype || "application/octet-stream";
	if (!ALLOWED_MIME_TYPES.has(mimeType)) {
		throw new AppError(400, `Tipo de arquivo não permitido: ${mimeType}`);
	}
}
