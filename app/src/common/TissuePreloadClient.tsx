"use client";

import { useEffect } from "react";

import { BRAIN2D_PATH } from "./brain2dAsset";
import { BRAIN_BIN_PATH } from "./brainAsset";
import { DESKTOP_QUERY } from "./desktopQuery";

/**
 * La mitad de TissuePreload que cubre la navegación por cliente.
 *
 * React NUNCA ejecuta un <script> que renderiza en el cliente (avisa por
 * consola en dev: "Scripts inside React components are never executed when
 * rendering on the client"). O sea que al llegar a esta página por un link
 * —sin recargar— el script de TissuePreload.tsx no hace nada, y la descarga
 * del tejido volvía a caer en la cadena lenta. Medido en el build de
 * producción, desde el click, llegando a la home desde /blog (la única
 * página que a propósito no precarga el tejido): 411 ms sin esto, 128 ms
 * con esto.
 *
 * Por qué un efecto y no ReactDOM.preload(), que sería más declarativo y
 * además ya acepta `media` en React 19: el hint viaja dentro del payload
 * RSC, y Next PREFETCHEA los links que están a la vista. Con preload() el
 * blog empezaba a bajar los 466 KB del cerebro 3D solo por tener un link a
 * la home en pantalla — medido: prefetch de / a los 119 ms, .bin a los 171
 * ms. Justo lo que d3d9cb0 decidió no hacer, y lo que cuida el test "el
 * blog no monta el cerebro ni baja el tejido".
 *
 * Un efecto es imperativo: corre solo si la página de verdad se monta,
 * nunca durante un prefetch.
 */
const TissuePreloadClient = () => {
	useEffect(() => {
		const href = matchMedia(DESKTOP_QUERY).matches ? BRAIN_BIN_PATH : BRAIN2D_PATH;
		// En carga directa el <script> ya lo creó durante el parseo del HTML:
		// acá no hay nada que hacer. El selector va por href y no por
		// [as="fetch"] a secas porque Next usa ese mismo `as` para sus propios
		// preloads, y un guard más ancho cortaba de más.
		if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
		const l = document.createElement("link");
		l.rel = "preload";
		l.as = "fetch";
		// Sin crossOrigin el preload queda no-cors, no matchea el fetch() de
		// Brain3D, y el archivo se descarga dos veces.
		l.crossOrigin = "anonymous";
		l.href = href;
		document.head.appendChild(l);
	}, []);
	return null;
};

export default TissuePreloadClient;
