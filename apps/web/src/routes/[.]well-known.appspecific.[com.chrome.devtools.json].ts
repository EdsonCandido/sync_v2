// Chrome DevTools probes this URL for Automatic Workspace Folders.
// Without a matching route, React Router logs a noisy 404 in dev.
export async function loader() {
	return new Response(null, { status: 204 });
}
