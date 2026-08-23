import { GrantAllCompanyModulesService } from "./services/GrantAllCompanyModulesService";

async function main() {
	console.log(
		"Grant-all: liberar todos os módulos para empresas ativas (idempotente)…",
	);

	const result = await new GrantAllCompanyModulesService().execute();

	console.log(
		`Grant-all: ${result.processed}/${result.totalCompanies} empresas processadas.`,
	);

	if (result.failed.length > 0) {
		console.error("Grant-all: falhas:");
		for (const item of result.failed) {
			console.error(`  - ${item.tradeName} (${item.companyId}): ${item.error}`);
		}
		process.exitCode = 1;
		return;
	}

	console.log("Grant-all: concluído.");
}

main().catch((error) => {
	console.error("Grant-all: erro fatal.", error);
	process.exitCode = 1;
});
