/**
 * The site's canonical domain.
 *
 * `||` and not `??`: an environment variable that's defined but empty —
 * what happens in GitHub Actions when a workflow references a secret that
 * doesn't exist — arrives as "", not as undefined. With `??` that slipped
 * through, SITE_URL ended up empty, and `new URL("")` broke the build (in
 * /studio, where metadataBase gets built when the module loads).
 */
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://joaquinmussi.com.ar";

/** JSON-LD node id of the site's Person, so pages can reference it. */
export const PERSON_ID = `${SITE_URL}/#person`;
