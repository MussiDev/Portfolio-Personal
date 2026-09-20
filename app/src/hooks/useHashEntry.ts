"use client";

import { useEffect } from "react";

/**
 * Si la URL llega con un hash de paso (#paso-N) — un link compartido, un
 * refresh, o el destino de los 301 de next.config.js (/contacto → /#paso-5)
 * — lleva al usuario a ese paso y CONSERVA el hash.
 *
 * Antes esto borraba el hash sin scrollear, para que el primer render
 * siempre empezara en el hero. El costo era que el sitio destruía sus
 * propias URLs: los redirects permanentes aterrizaban en el hero, el
 * BreadcrumbList del blog declaraba a Google una URL que el cliente
 * anulaba, y ninguna sección era compartible. El hero limpio ya es lo que
 * pasa cuando no hay hash; no hacía falta forzarlo cuando sí lo hay.
 *
 * El salto es instantáneo a propósito (`auto`, no `smooth`): scrollear
 * suave desde el hero hasta el paso 5 en la primera carga es un viaje
 * largo por contenido que el usuario no pidió ver.
 */
export const useHashEntry = (pathname: string): void => {
	useEffect(() => {
		const match = /^#paso-(\d+)$/.exec(window.location.hash);
		if (!match) return;

		const target = document.getElementById(`paso-${match[1]}`);
		if (!target) return;

		// Después del layout: en la primera carga las secciones todavía se
		// están midiendo (fuentes, [data-revelar]) y un scroll inmediato
		// aterriza en la posición equivocada.
		const raf = requestAnimationFrame(() => {
			target.scrollIntoView({ behavior: "auto", block: "start" });
		});
		return () => cancelAnimationFrame(raf);
	}, [pathname]);
};
