/** Helpers de máscara CPF (sem regra de negócio). */

export function parseCpfDigits(raw: string): string {
	return raw.replace(/\D/g, "").slice(0, 11);
}

/** Formata enquanto digita: `000.000.000-00`. */
export function maskCpfInput(raw: string): string {
	const digits = parseCpfDigits(raw);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
	if (digits.length <= 9) {
		return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
	}
	return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Exibe CPF já salvo (só dígitos ou parcial). */
export function formatCpf(raw: string): string {
	return maskCpfInput(raw);
}
