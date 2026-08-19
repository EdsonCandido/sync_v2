import { APP_VERSION } from "@/lib/app-version";

export async function loader() {
	return Response.json(
		{ version: APP_VERSION },
		{
			headers: {
				"Cache-Control": "no-store",
			},
		},
	);
}
