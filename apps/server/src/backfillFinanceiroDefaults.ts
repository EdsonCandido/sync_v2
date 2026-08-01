import { BackfillCompaniesFinanceiroDefaultsService } from "./services/BackfillCompaniesFinanceiroDefaultsService";

async function main() {
	console.log("Backfill: categorias + centros de custo padrão (idempotente)…");

	const result =
		await new BackfillCompaniesFinanceiroDefaultsService().execute();

	console.log(
		`Backfill: ${result.processed}/${result.totalCompanies} empresas processadas.`,
	);

	if (result.failed.length > 0) {
		console.error("Backfill: falhas:");
		for (const item of result.failed) {
			console.error(`  - ${item.tradeName} (${item.companyId}): ${item.error}`);
		}
		process.exitCode = 1;
		return;
	}

	console.log(
		"Backfill: concluído sem duplicidade (pula name/código já ativos).",
	);
}

main().catch((error) => {
	console.error("Backfill: erro fatal.", error);
	process.exitCode = 1;
});
