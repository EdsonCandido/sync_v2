import type { FinanceiroReportQuery } from "@sync_v2/contracts";
import { FinanceiroPdfHelper } from "./FinanceiroPdfHelper";
import { GetDespesasPeriodoReportService } from "./GetDespesasPeriodoReportService";

export class GenerateDespesasPeriodoPdfService {
	constructor(
		private readonly getService = new GetDespesasPeriodoReportService(),
		private readonly pdfHelper = new FinanceiroPdfHelper(),
	) {}

	async execute(companyId: string, query: FinanceiroReportQuery) {
		const report = await this.getService.execute(companyId, query);
		return this.pdfHelper.render({ companyId, report });
	}
}
