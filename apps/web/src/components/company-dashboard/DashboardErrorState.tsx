import { EmptyState } from "@/components/ui/EmptyState";

type DashboardErrorStateProps = {
	message?: string;
	onRetry: () => void;
};

export function DashboardErrorState({
	message,
	onRetry,
}: DashboardErrorStateProps) {
	return (
		<EmptyState
			title="Não foi possível carregar"
			description={message ?? "Tente novamente em instantes."}
			actionLabel="Tentar de novo"
			onAction={onRetry}
			borderColor="red.emphasized"
		/>
	);
}
