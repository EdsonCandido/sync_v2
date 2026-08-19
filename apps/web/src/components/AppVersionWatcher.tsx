import { useEffect } from "react";

import { toaster } from "@/components/ui/toaster";
import { APP_VERSION, fetchRemoteAppVersion } from "@/lib/app-version";

const POLL_MS = 30_000;
const RELOAD_MS = 5_000;
const STORAGE_PREFIX = "sync-app-reload:";

export function AppVersionWatcher() {
	useEffect(() => {
		if (import.meta.env.DEV) return;

		let cancelled = false;
		let reloadTimer: number | undefined;

		async function check() {
			if (cancelled || reloadTimer !== undefined) return;
			const remote = await fetchRemoteAppVersion();
			if (cancelled || reloadTimer !== undefined) return;
			if (!remote || remote === APP_VERSION) return;

			const flag = `${STORAGE_PREFIX}${remote}`;
			if (sessionStorage.getItem(flag) === "1") return;
			sessionStorage.setItem(flag, "1");

			toaster.create({
				id: "app-version-reload",
				title: "Nova versão disponível",
				description: "O sistema será atualizado em 5 segundos.",
				type: "info",
				duration: RELOAD_MS,
				closable: false,
			});

			reloadTimer = window.setTimeout(() => {
				window.location.reload();
			}, RELOAD_MS);
		}

		void check();
		const intervalId = window.setInterval(() => {
			void check();
		}, POLL_MS);

		function onVisibility() {
			if (document.visibilityState === "visible") void check();
		}
		document.addEventListener("visibilitychange", onVisibility);

		return () => {
			cancelled = true;
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", onVisibility);
			if (reloadTimer !== undefined) window.clearTimeout(reloadTimer);
		};
	}, []);

	return null;
}
