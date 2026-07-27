import { env } from "@sync_v2/env/server";
import {
	ITR_DOWNLOAD_COLUMN_SLUGS,
	ITR_KANBAN_COLUMN_SLUGS,
	ITR_PUBLIC_STATUS_MESSAGES,
	type ItrKanbanColumnSlug,
} from "@sync_v2/types";
import { CompanyRepository } from "../repositories/CompanyRepository";
import {
	ItrFileRepository,
	ItrProcessRepository,
} from "../repositories/ItrProcessRepository";
import { AppError } from "../utils/AppError";

const DOWNLOAD_SET = new Set<string>(ITR_DOWNLOAD_COLUMN_SLUGS);
const SLUG_SET = new Set<string>(ITR_KANBAN_COLUMN_SLUGS);

export class ResolveHeliosCompanyService {
	constructor(private readonly companyRepository = new CompanyRepository()) {}

	async execute() {
		const raw =
			env.ITR_PUBLIC_COMPANY_DOCUMENT ?? env.SEED_COMPANY_DOCUMENT ?? null;
		if (!raw) {
			throw new AppError(500, "ITR_PUBLIC_COMPANY_DOCUMENT não configurado.");
		}
		const document = raw.replace(/\D/g, "");
		const company = await this.companyRepository.findByDocument(document);
		if (!company?.ativo) {
			throw new AppError(404, "Empresa Helios não encontrada.");
		}
		return company;
	}
}

export class PublicConsultItrService {
	constructor(
		private readonly resolveHelios = new ResolveHeliosCompanyService(),
		private readonly processRepository = new ItrProcessRepository(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(cpf: string) {
		const document = normalizeCpf(cpf);
		if (document.length !== 11) {
			throw new AppError(400, "CPF inválido.");
		}

		const company = await this.resolveHelios.execute();
		const rows = await this.processRepository.listByCompanyAndDocument(
			company.id,
			document,
		);

		const items = await Promise.all(
			rows.map(async (row) => {
				const slug = row.columnSlug;
				const canDownload = DOWNLOAD_SET.has(slug);
				const message = statusMessage(slug);
				const files = canDownload
					? await this.fileRepository.listByProcess(row.process.id)
					: [];

				return {
					id: row.process.id,
					clientName: row.clientName,
					statusSlug: slug,
					statusLabel: row.columnName,
					message,
					canDownload,
					files: files.map((f) => ({
						id: f.id,
						kind: f.kind as "declaracao" | "recibo" | "anexo",
						originalName: f.originalName,
						mimeType: f.mimeType,
						sizeBytes: f.sizeBytes,
					})),
					createdAt: row.process.createdAt,
				};
			}),
		);

		return { items };
	}
}

export class PublicDownloadItrFileService {
	constructor(
		private readonly resolveHelios = new ResolveHeliosCompanyService(),
		private readonly fileRepository = new ItrFileRepository(),
	) {}

	async execute(fileId: string, cpf: string) {
		const document = normalizeCpf(cpf);
		if (document.length !== 11) {
			throw new AppError(400, "CPF inválido.");
		}

		const company = await this.resolveHelios.execute();
		const row = await this.fileRepository.findByIdWithProcess(fileId);
		if (!row) {
			throw new AppError(404, "Arquivo não encontrado.");
		}
		if (row.process.companyId !== company.id) {
			throw new AppError(404, "Arquivo não encontrado.");
		}
		if (row.clientDocument !== document) {
			throw new AppError(403, "CPF não correspondente.");
		}
		if (!DOWNLOAD_SET.has(row.columnSlug)) {
			throw new AppError(403, statusMessage(row.columnSlug));
		}

		return {
			originalName: row.file.originalName,
			mimeType: row.file.mimeType,
			content: row.file.content,
		};
	}
}

function normalizeCpf(cpf: string) {
	return cpf.replace(/\D/g, "");
}

function statusMessage(slug: string) {
	if (SLUG_SET.has(slug)) {
		return ITR_PUBLIC_STATUS_MESSAGES[slug as ItrKanbanColumnSlug];
	}
	return "aguardando liberação";
}
