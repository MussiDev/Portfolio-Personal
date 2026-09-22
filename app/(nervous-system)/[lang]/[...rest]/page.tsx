import { notFound } from "next/navigation";

/**
 * Any path under a language that no route claims. Without this, Next served
 * its own white, English 404 outside the site's layout; throwing here renders
 * ../not-found.tsx inside it, with the right <html lang> and a 404 status.
 */
const UnknownPath = () => notFound();

export default UnknownPath;
