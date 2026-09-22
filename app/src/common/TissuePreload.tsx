import { BRAIN2D_PATH } from "./brain2dAsset";
import { BRAIN_BIN_PATH } from "./brainAsset";
import { DESKTOP_QUERY } from "./desktopQuery";
import TissuePreloadClient from "./TissuePreloadClient";

/**
 * Starts downloading the brain tissue while the HTML is still parsing.
 *
 * The .bin used to be requested at the end of a seven-step serial chain:
 * HTML → bundle → hydration → useIsDesktop effect → dynamic import of
 * Brain3D → three.js chunk → fetch. Measured: the document was interactive
 * at ~32ms and the .bin didn't start until ~487ms.
 *
 * Why a script and not <link rel="preload"> in JSX? React drops that link
 * silently (it never reaches the HTML). Its supported API, ReactDOM.preload(),
 * DOES accept `media` as of React 19 — an older version of this comment said
 * it did not — but it is still the wrong tool here: the hint travels inside
 * the RSC payload, and Next prefetches the links that are on screen, so the
 * blog started downloading the 466 KB 3D brain just for having a link to the
 * home in view (measured: prefetch of / at 119 ms, .bin at 171 ms). That is
 * exactly what d3d9cb0 decided not to do. The matchMedia here keeps the
 * decision intact: each viewport preloads ITS brain, the 3D one on desktop
 * and the ~27 KB 2D projection on a phone, never both.
 *
 * `crossOrigin` is not decorative: without it the preload stays no-cors,
 * doesn't match Brain3D's fetch(), and the file downloads twice.
 *
 * THE KNOWN WARNING. React never executes a <script> it renders on the
 * CLIENT and says so in dev ("Scripts inside React components are never
 * executed when rendering on the client"). That warning is expected here and
 * is not a leftover: on a direct load this script is what gets the tissue
 * moving at ~68 ms, which no client-side hook can match, and on a
 * client-side navigation TissuePreloadClient.tsx takes over. Measured on the
 * production build:
 *
 *                              solo <script>   con el cliente
 *   desktop, direct load            68 ms           68 ms
 *   /blog → home, from the click   411 ms          128 ms
 *
 * It lives in the pages that show the brain, not in the layout: since the
 * brain moved to the layout, a preload there would make the blog pay for
 * tissue it never renders (see escena.ts).
 */
const SCRIPT = `var l=document.createElement("link");
l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";
l.href=matchMedia(${JSON.stringify(DESKTOP_QUERY)}).matches?${JSON.stringify(BRAIN_BIN_PATH)}:${JSON.stringify(BRAIN2D_PATH)};
document.head.appendChild(l);`;

const TissuePreload = () => (
	<>
		<script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
		<TissuePreloadClient />
	</>
);

export default TissuePreload;
