import type { CreateKanbanColumnInput } from "@sync_v2/contracts";
import { KanbanColumnRepository } from "../repositories/KanbanColumnRepository";
import { AppError } from "../utils/AppError";
import { EnsureBaseKanbanColumnsService } from "./EnsureBaseKanbanColumnsService";

export class CreateKanbanColumnService {
	constructor(
		private readonly ensureBase = new EnsureBaseKanbanColumnsService(),
		private readonly columnRepository = new KanbanColumnRepository(),
	) {}

	async execute(input: CreateKanbanColumnInput, companyId: string) {
		await this.ensureBase.execute(companyId);

		const name = input.name.trim();
		if (!name) {
			throw new AppError(400, "Nome da coluna obrigatório.");
		}

		const slug = slugify(name);
		const existing = await this.columnRepository.findBySlugAny(companyId, slug);
		if (existing?.ativo) {
			throw new AppError(409, "Já existe coluna com este nome.");
		}

		const position = await this.columnRepository.nextPosition(companyId);

		if (existing && !existing.ativo && !existing.isBase) {
			const restored = await this.columnRepository.reactivate(existing.id, {
				name,
				position,
			});
			if (!restored) {
				throw new AppError(500, "Falha ao restaurar coluna.");
			}
			return restored;
		}

		return this.columnRepository.create({
			companyId,
			name,
			slug,
			position,
			isBase: false,
		});
	}
}

function slugify(value: string) {
	return (
		value
			.normalize("NFD")
			.replace(/\p{M}/gu, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "")
			.slice(0, 60) || `coluna_${Date.now()}`
	);
}
