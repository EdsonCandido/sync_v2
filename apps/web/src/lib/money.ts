/** Helpers de máscara monetária BRL (centavos enquanto digita). Sem regra de negócio. */

export type MoneyMaskOptions = {
	allowNegative?: boolean;
};

/** Formata string digitada (só dígitos = centavos) para `R$ 1.234,56`. */
export function maskMoneyInput(
	raw: string,
	options?: MoneyMaskOptions,
): string {
	const negative =
		Boolean(options?.allowNegative) && /^-/.test(raw.trimStart());
	const digits = raw.replace(/\D/g, "");
	if (!digits) return negative ? "-" : "";
	const value = (Number(digits) / 100) * (negative ? -1 : 1);
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

/** Converte máscara BRL em number (centavos). `NaN` se vazio/inválido. */
export function parseMoneyInput(masked: string): number {
	const trimmed = masked.trim();
	if (!trimmed || trimmed === "-") return Number.NaN;
	const negative = /^-/.test(trimmed);
	const digits = trimmed.replace(/\D/g, "");
	if (!digits) return Number.NaN;
	const value = Number(digits) / 100;
	return negative ? -value : value;
}

/** Number → string mascarada para pré-preencher inputs. */
export function numberToMoneyInput(value: number): string {
	if (!Number.isFinite(value)) return "";
	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}
