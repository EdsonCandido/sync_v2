export type ColumnAccent = {
	bar: string;
	bg: string;
	icon: string;
	badge: string;
};

export function getColumnAccent(slug: string): ColumnAccent {
	switch (slug) {
		case "a_fazer":
			return {
				bar: "blue.solid",
				bg: "blue.subtle",
				icon: "blue.fg",
				badge: "blue",
			};
		case "em_execucao":
			return {
				bar: "orange.solid",
				bg: "orange.subtle",
				icon: "orange.fg",
				badge: "orange",
			};
		case "concluido":
			return {
				bar: "green.solid",
				bg: "green.subtle",
				icon: "green.fg",
				badge: "green",
			};
		case "cancelado":
			return {
				bar: "gray.solid",
				bg: "bg.muted",
				icon: "fg.muted",
				badge: "gray",
			};
		default:
			return {
				bar: "helios.solid",
				bg: "helios.subtle",
				icon: "helios.fg",
				badge: "purple",
			};
	}
}

export function isCardOverdue(
	dueAt: string | null | undefined,
	columnSlug: string,
) {
	if (!dueAt) return false;
	if (columnSlug === "concluido" || columnSlug === "cancelado") return false;
	return new Date(dueAt).getTime() < Date.now();
}
