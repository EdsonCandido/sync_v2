import { CompanyRepository } from "../repositories/CompanyRepository";
import { AppError } from "../utils/AppError";

export class SoftDeleteCompanyService {
	constructor(private readonly companyRepository = new CompanyRepository()) {}

	async execute(id: string, userId: string) {
		const deleted = await this.companyRepository.softDelete(id, userId);
		if (!deleted) {
			throw new AppError(404, "Empresa não encontrada.");
		}
		return deleted;
	}
}
