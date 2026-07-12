import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_SERVER_URL: z.url(),
	},
	runtimeEnv: (import.meta as any).env,
	skipValidation: !!(
		globalThis as { process?: { env?: Record<string, string> } }
	).process?.env?.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
