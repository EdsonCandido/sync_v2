import type { FinanceiroReportQuery } from "@sync_v2/contracts";
import { FinanceiroPdfHelper } from "./FinanceiroPdfHelper";
import { GetReceitasPeriodoReportService } from "./GetReceitasPeriodoReportService";

export class GenerateReceitasPeriodoPdfService {
	constructor(
		private readonly getService = new GetReceitasPeriodoReportService(),
		private readonly pdfHelper = new FinanceiroPdfHelper(),
	) {}

	async execute(companyId: string, query: FinanceiroReportQuery) {
		const report = await this.getService.execute(companyId, query);
		return this.pdfHelper.render({ companyId, report });
	}
}
