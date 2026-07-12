import type { ChangeOwnPasswordInput } from "@sync_v2/contracts";
import { auth } from "../auth";
import { AppError } from "../utils/AppError";

export class ChangeOwnPasswordService {
	async execute(input: ChangeOwnPasswordInput, headers: Headers) {
		try {
			await auth.api.changePassword({
				body: {
					currentPassword: input.currentPassword,
					newPassword: input.newPassword,
					revokeOtherSessions: false,
				},
				headers,
			});
			return { ok: true as const };
		} catch (error) {
			const message =
				error &&
				typeof error === "object" &&
				"message" in error &&
				typeof (error as { message: unknown }).message === "string"
					? (error as { message: string }).message
					: "Falha ao trocar senha.";
			throw new AppError(400, message);
		}
	}
}
