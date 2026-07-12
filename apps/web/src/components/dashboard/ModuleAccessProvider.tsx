import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { authClient } from "@/lib/auth-client";
import {
	type ModuleKey,
	type ModulePermissionItem,
	modulePermissionsApi,
} from "@/lib/module-permissions-api";

type ModuleAccessContextValue = {
	loading: boolean;
	modules: ModulePermissionItem[];
	canRead: (moduleKey: ModuleKey) => boolean;
	canEdit: (moduleKey: ModuleKey) => boolean;
	refresh: () => Promise<void>;
};

const ModuleAccessContext = createContext<ModuleAccessContextValue | null>(
	null,
);

export function ModuleAccessProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const [loading, setLoading] = useState(true);
	const [modules, setModules] = useState<ModulePermissionItem[]>([]);

	const refresh = useCallback(async () => {
		if (!session) {
			setModules([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const result = await modulePermissionsApi.me();
			setModules(result.modules);
		} catch {
			setModules([]);
		} finally {
			setLoading(false);
		}
	}, [session]);

	useEffect(() => {
		if (isPending) return;
		void refresh();
	}, [isPending, refresh]);

	const byKey = useMemo(() => {
		const map = new Map<ModuleKey, ModulePermissionItem>();
		for (const item of modules) {
			map.set(item.moduleKey, item);
		}
		return map;
	}, [modules]);

	const value = useMemo<ModuleAccessContextValue>(
		() => ({
			loading: loading || isPending,
			modules,
			canRead: (moduleKey) => {
				const grant = byKey.get(moduleKey);
				return Boolean(grant?.canRead || grant?.canEdit);
			},
			canEdit: (moduleKey) => Boolean(byKey.get(moduleKey)?.canEdit),
			refresh,
		}),
		[loading, isPending, modules, byKey, refresh],
	);

	return (
		<ModuleAccessContext.Provider value={value}>
			{children}
		</ModuleAccessContext.Provider>
	);
}

export function useModuleAccess() {
	const ctx = useContext(ModuleAccessContext);
	if (!ctx) {
		throw new Error("useModuleAccess must be used within ModuleAccessProvider");
	}
	return ctx;
}
