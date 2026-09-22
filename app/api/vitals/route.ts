import { z } from "zod";

/**
 * WebVitals.tsx's own destination for the Core Web Vitals it reports.
 *
 * Without this the report was installed but sending nothing: it depended
 * on an environment variable that was never set. Here every real metric —
 * measured in the browser of someone who visited the site — ends up as a
 * JSON line in the server logs, filterable by `"type":"web-vital"`. No
 * vendor, no cookies, no third-party scripts.
 *
 * It's a public endpoint that writes to logs, so it distrusts everything: a
 * size cap and a strict schema. Anything that isn't a known metric with
 * reasonable values gets discarded without logging anything.
 */

const MAX_BYTES = 1024;

const Metric = z.object({
	name: z.enum(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]),
	value: z.number().nonnegative().max(600_000),
	rating: z.enum(["good", "needs-improvement", "poor"]),
	id: z.string().max(100),
	path: z.string().startsWith("/").max(200),
});

export async function POST(request: Request) {
	const body = await request.text();
	if (body.length > MAX_BYTES) return new Response(null, { status: 413 });

	let metric: z.infer<typeof Metric>;
	try {
		metric = Metric.parse(JSON.parse(body));
	} catch {
		return new Response(null, { status: 400 });
	}

	console.log(
		JSON.stringify({ type: "web-vital", ...metric, receivedAt: new Date().toISOString() }),
	);
	// 204: sendBeacon doesn't read the response, and there's nothing to return.
	return new Response(null, { status: 204 });
}
