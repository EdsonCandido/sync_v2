/** Helpers de máscara telefone BR (sem regra de negócio). */

export function parsePhoneDigits(raw: string): string {
	return raw.replace(/\D/g, "").slice(0, 11);
}

/** Formata enquanto digita: `(11) 98765-4321` ou `(11) 3456-7890`. */
export function maskPhoneInput(raw: string): string {
	const digits = parsePhoneDigits(raw);
	if (digits.length === 0) return "";
	if (digits.length <= 2) return `(${digits}`;
	if (digits.length <= 6) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}
	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
