/** Shared pure helpers. No business logic. */

/** Gera UUID v4. Usar em inserts de domínio quando o default do schema não aplica. */
export function createId(): string {
	return crypto.randomUUID();
}
