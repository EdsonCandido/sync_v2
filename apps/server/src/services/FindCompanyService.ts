import { CompanyRepository } from "../repositories/CompanyRepository";
import { AppError } from "../utils/AppError";

export class FindCompanyService {
	constructor(private readonly companyRepository = new CompanyRepository()) {}

	async execute(id: string) {
		const company = await this.companyRepository.findById(id);
		if (!company) {
			throw new AppError(404, "Empresa não encontrada.");
		}
		return company;
	}
}
