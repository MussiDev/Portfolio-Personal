"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query with `useSyncExternalStore`, the API made
 * exactly for this: reading an external store (matchMedia) with SSR
 * support.
 *
 * Every consumer used to do `useState` + `useEffect(() => setX(mq.matches))`.
 * That works, but triggers a cascading render on every mount — React
 * renders with the initial value, runs the effect, sets state, and renders
 * again. `useSyncExternalStore` resolves the value in the same pass.
 *
 * Returns `null` on the server and on the hydration render, and the real
 * value from then on: that's what avoids guessing a breakpoint and then
 * correcting itself (see useIsDesktop).
 */
export const useMediaQuery = (query: string): boolean | null => {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const mq = window.matchMedia(query);
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		},
		[query],
	);
	const getSnapshot = useCallback(
		() => window.matchMedia(query).matches,
		[query],
	);
	// The server's snapshot is `null`: there's no window to query, and
	// faking a value produces exactly the flicker this avoids.
	const getServerSnapshot = useCallback(() => null, []);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

const subscribeToNothing = () => () => {};

/** `false` on the server and during hydration, `true` afterward. For
 * content that can't render on the server (the reCAPTCHA widget). */
export const useIsMounted = (): boolean =>
	useSyncExternalStore(
		subscribeToNothing,
		() => true,
		() => false,
	);
