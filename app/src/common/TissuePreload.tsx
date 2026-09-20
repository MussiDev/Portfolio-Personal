import { BRAIN2D_PATH } from "./brain2dAsset";
import { BRAIN_BIN_PATH } from "./brainAsset";
import { DESKTOP_QUERY } from "./desktopQuery";

/**
 * Starts downloading the brain tissue while the HTML is still parsing.
 *
 * The .bin used to be requested at the end of a seven-step serial chain:
 * HTML → bundle → hydration → useIsDesktop effect → dynamic import of
 * Brain3D → three.js chunk → fetch. Measured: the document was interactive
 * at ~32ms and the .bin didn't start until ~487ms.
 *
 * Why a script and not <link rel="preload"> in JSX? React drops that link
 * silently (it never reaches the HTML), and its supported API,
 * ReactDOM.preload(), takes no `media` — without it a phone would download
 * the 466 KB that d3d9cb0 decided not to download. The matchMedia here
 * keeps that decision intact: each viewport preloads ITS brain, the 3D one
 * on desktop and the ~27 KB 2D projection on a phone, never both.
 *
 * `crossOrigin` is not decorative: without it the preload stays no-cors,
 * doesn't match Brain3D's fetch(), and the file downloads twice.
 *
 * It lives in the pages that show the brain, not in the layout: since the
 * brain moved to the layout, a preload there would make the blog pay for
 * tissue it never renders (see escena.ts).
 */
const SCRIPT = `var l=document.createElement("link");
l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";
l.href=matchMedia(${JSON.stringify(DESKTOP_QUERY)}).matches?${JSON.stringify(BRAIN_BIN_PATH)}:${JSON.stringify(BRAIN2D_PATH)};
document.head.appendChild(l);`;

const TissuePreload = () => <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;

export default TissuePreload;
