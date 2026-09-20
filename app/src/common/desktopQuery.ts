/**
 * What "desktop" means for the nervous system: enough width for the 3D brain
 * AND a pointer that can hover. The 3D index is discovered by hovering
 * regions; a 1024px iPad has the width but not the hover, and used to get a
 * UI whose summaries and connections only appeared on mouseover.
 *
 * Keep in sync with the `desk` screen in tailwind.config.js (a CommonJS file
 * that cannot import this module).
 */
export const DESKTOP_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
