"use client";

import { useEffect } from "react";

/**
 * If the URL arrives with a step hash (#step-N) — a shared link, a
 * refresh, or the destination of next.config.js's 301s (/contacto →
 * /#step-5) — it takes the user to that step and KEEPS the hash.
 *
 * This used to clear the hash without scrolling, so the first render
 * always started at the hero. The cost was that the site destroyed its own
 * URLs: permanent redirects landed on the hero, the blog's BreadcrumbList
 * declared a URL to Google that the client would undo, and no section was
 * shareable. The clean hero is already what happens when there's no hash;
 * it didn't need to be forced when there is one.
 *
 * The jump is instant on purpose (`auto`, not `smooth`): smoothly
 * scrolling from the hero to step 5 on the first load is a long trip
 * through content the user didn't ask to see.
 */
export const useHashEntry = (pathname: string): void => {
	useEffect(() => {
		const match = /^#step-(\d+)$/.exec(window.location.hash);
		if (!match) return;

		const target = document.getElementById(`step-${match[1]}`);
		if (!target) return;

		// After the layout: on the first load the sections are still being
		// measured (fonts, [data-reveal]) and an immediate scroll lands in
		// the wrong position.
		const raf = requestAnimationFrame(() => {
			target.scrollIntoView({ behavior: "auto", block: "start" });
		});
		return () => cancelAnimationFrame(raf);
	}, [pathname]);
};
