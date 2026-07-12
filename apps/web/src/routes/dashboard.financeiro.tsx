import { ModuleGate } from "@/components/dashboard/ModuleGate";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function DashboardFinanceiro() {
	return (
		<ModuleGate moduleKey="financeiro">
			<ModulePlaceholder title="Financeiro" />
		</ModuleGate>
	);
}
