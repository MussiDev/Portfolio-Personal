"use client";

import { useEffect } from "react";

/**
 * Si la URL llega con un hash de paso (#paso-N) — típicamente de un
 * refresh o de un link compartido — lo saca sin scrollear, para que el
 * primer render siempre empiece en el hero.
 */
export const useHashCleanup = () => {
	useEffect(() => {
		if (!/^#paso-\d+$/.test(window.location.hash)) return;
		history.replaceState(
			null,
			"",
			window.location.pathname + window.location.search,
		);
	}, []);
};
