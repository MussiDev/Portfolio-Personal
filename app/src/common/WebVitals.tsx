"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Reports real Core Web Vitals (LCP, INP, CLS, FCP, TTFB) measured in
 * actual visitors' browsers, not in a lab Lighthouse run.
 *
 * Without this the site measured absolutely nothing: there was no way to
 * know whether real LCP is 1.2s or 4s, or to detect that a change made it
 * worse. A portfolio presenting itself as "architecture and performance"
 * has to be able to answer that question with a number.
 *
 * Deliberately brings NO vendor: `useReportWebVitals` is Next's own, zero
 * new dependencies, zero third-party scripts, zero cookies. By default the
 * metrics go to /api/vitals, which drops them into the server logs. The
 * destination used to depend on an environment variable that was never
 * set, so the report was installed and measuring nothing.
 *
 *   (unset)                                 → POST to /api/vitals
 *   NEXT_PUBLIC_VITALS_ENDPOINT=https://…    → POST to that destination
 *
 * If the endpoint is on another origin, next.config.js adds it to the
 * CSP's connect-src on its own: without that the beacon would be blocked
 * silently and this would look like it works without working.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT || "/api/vitals";

// Next also reports its own metrics (hydration, route rendering). Only the
// Core Web Vitals travel, which is what /api/vitals accepts.
const WEB_VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]);

const WebVitals = (): null => {
	useReportWebVitals((metric) => {
		if (process.env.NODE_ENV !== "production") {
			// In dev the destination is the console: useful to see a change's
			// effect without setting up infrastructure.
			console.info(
				`[vitals] ${metric.name} ${Math.round(metric.value)} (${metric.rating})`,
			);
			return;
		}

		if (!WEB_VITALS.has(metric.name)) return;

		const body = JSON.stringify({
			name: metric.name,
			value: metric.value,
			rating: metric.rating,
			id: metric.id,
			path: window.location.pathname,
		});

		// sendBeacon survives the tab closing, which is exactly when the
		// final metrics get reported; fetch with keepalive is the fallback.
		if (navigator.sendBeacon) {
			navigator.sendBeacon(ENDPOINT, body);
			return;
		}
		void fetch(ENDPOINT, {
			body,
			method: "POST",
			keepalive: true,
			headers: { "Content-Type": "application/json" },
		}).catch(() => {
			// Losing a metric can never break the page.
		});
	});

	return null;
};

export default WebVitals;
