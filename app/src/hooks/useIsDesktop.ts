"use client";

import { DESKTOP_QUERY } from "../common/desktopQuery";
import { useMediaQuery } from "./useMediaQuery";

/**
 * `null` mientras no se sabe todavía (server y render de hidratación) — a
 * propósito, para no tener que adivinar mobile o desktop y después
 * corregirse: el cerebro 3D nunca se monta hasta que esto resuelve a
 * `true`, así que un visitante mobile jamás dispara el import de
 * three.js ni por un instante.
 *
 * Antes era useState + useEffect(setIsDesktop(...)), que produce un render
 * en cascada en cada montaje. La suscripción vive ahora en useMediaQuery.
 */
export const useIsDesktop = (): boolean | null => useMediaQuery(DESKTOP_QUERY);
