import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [reactRouter(), tsconfigPaths()],
	build: {
		// PNGs/WebPs da landing ficam assets hashed (não data-URL)
		assetsInlineLimit: 4096,
		// Mostra tamanho gzip no report do build
		reportCompressedSize: true,
		cssCodeSplit: true,
	},
});
