import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "./src/index.ts",
		seed: "./src/seed.ts",
		backfillFinanceiroDefaults: "./src/backfillFinanceiroDefaults.ts",
		grantAllCompanyModules: "./src/grantAllCompanyModules.ts",
	},
	format: "esm",
	outDir: "./dist",
	clean: true,
	noExternal: [/@sync_v2\/.*/],
});
