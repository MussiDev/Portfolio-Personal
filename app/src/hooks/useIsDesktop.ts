"use client";

import { DESKTOP_QUERY } from "../common/desktopQuery";
import { useMediaQuery } from "./useMediaQuery";

/**
 * `null` while it isn't known yet (server and hydration render) — on
 * purpose, to avoid guessing mobile or desktop and then correcting itself:
 * the 3D brain never mounts until this resolves to `true`, so a mobile
 * visitor never triggers the three.js import, not even for an instant.
 *
 * This used to be useState + useEffect(setIsDesktop(...)), which produces
 * a cascading render on every mount. The subscription now lives in
 * useMediaQuery.
 */
export const useIsDesktop = (): boolean | null => useMediaQuery(DESKTOP_QUERY);
