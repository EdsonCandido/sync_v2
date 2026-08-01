import { EmptyState } from "@/components/ui/EmptyState";

type DashboardEmptyStateProps = {
	onRetry?: () => void;
};

export function DashboardEmptyState({ onRetry }: DashboardEmptyStateProps) {
	return (
		<EmptyState
			title="Sem dados ainda"
			description="Quando houver usuários, acessos e pendências, o panorama da empresa aparece aqui."
			actionLabel={onRetry ? "Atualizar" : undefined}
			onAction={onRetry}
		/>
	);
}
