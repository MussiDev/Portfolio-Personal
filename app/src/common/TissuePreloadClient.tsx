"use client";

import { useEffect } from "react";

import { BRAIN2D_PATH } from "./brain2dAsset";
import { BRAIN_BIN_PATH } from "./brainAsset";
import { DESKTOP_QUERY } from "./desktopQuery";

/**
 * The half of TissuePreload that covers client-side navigation.
 *
 * React NEVER executes a <script> that renders on the client (it warns in
 * the console during dev: "Scripts inside React components are never
 * executed when rendering on the client"). Meaning: on reaching this page
 * via a link — without a reload — TissuePreload.tsx's script does nothing,
 * and the tissue's download fell back to the slow chain. Measured on the
 * production build, from the click, arriving at the home from /blog (the
 * only page that deliberately doesn't preload the tissue): 411 ms without
 * this, 128 ms with it.
 *
 * Why an effect and not ReactDOM.preload(), which would be more
 * declarative and already accepts `media` in React 19: the hint travels
 * inside the RSC payload, and Next PREFETCHES links that are in view. With
 * preload(), the blog would start downloading the 3D brain's 466 KB just
 * from having a link to the home on screen — measured: prefetch of / at
 * 119 ms, .bin at 171 ms. Exactly what d3d9cb0 decided not to do, and what
 * the "the blog doesn't mount the brain or download the tissue" test
 * guards.
 *
 * An effect is imperative: it only runs if the page actually mounts, never
 * during a prefetch.
 */
const TissuePreloadClient = () => {
	useEffect(() => {
		const href = matchMedia(DESKTOP_QUERY).matches ? BRAIN_BIN_PATH : BRAIN2D_PATH;
		// On a direct load the <script> already created it while parsing the
		// HTML: there's nothing to do here. The selector matches on href and
		// not on [as="fetch"] alone because Next uses that same `as` for its
		// own preloads, and a wider guard cut too much.
		if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
		const l = document.createElement("link");
		l.rel = "preload";
		l.as = "fetch";
		// Without crossOrigin the preload stays no-cors, doesn't match
		// Brain3D's fetch(), and the file downloads twice.
		l.crossOrigin = "anonymous";
		l.href = href;
		document.head.appendChild(l);
	}, []);
	return null;
};

export default TissuePreloadClient;
