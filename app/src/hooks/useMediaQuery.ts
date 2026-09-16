"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Suscripción a una media query con `useSyncExternalStore`, que es la API
 * hecha exactamente para esto: leer un store externo (matchMedia) con
 * soporte de SSR.
 *
 * Antes cada consumidor hacía `useState` + `useEffect(() => setX(mq.matches))`.
 * Eso funciona, pero dispara un render en cascada en cada montaje — React
 * renderiza con el valor inicial, corre el efecto, setea estado y vuelve a
 * renderizar. `useSyncExternalStore` resuelve el valor en el mismo pase.
 *
 * Devuelve `null` en el server y en el render de hidratación, y el valor
 * real a partir de ahí: eso es lo que permite no adivinar un breakpoint y
 * después corregirse (ver useIsDesktop).
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
	// El snapshot del server es `null`: no hay ventana que consultar, y
	// fingir un valor produce exactamente el parpadeo que esto evita.
	const getServerSnapshot = useCallback(() => null, []);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

const subscribeToNothing = () => () => {};

/** `false` en el server y en la hidratación, `true` después. Para contenido
 * que no puede renderizarse en el server (el widget de reCAPTCHA). */
export const useIsMounted = (): boolean =>
	useSyncExternalStore(
		subscribeToNothing,
		() => true,
		() => false,
	);
