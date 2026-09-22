/**
 * Which Sanity project and dataset the site reads from.
 *
 * A single source for the client (sanity/lib/client.ts) and the Studio
 * (sanity.config.ts): the Studio used to have the values written by hand
 * while the client only read them from environment variables, so they
 * could point to different places with nothing warning about it.
 *
 * projectId isn't a secret — it travels in the browser bundle either way
 * —, so it has a real default value. `||` and not `??`: in GitHub Actions
 * a secret that doesn't exist arrives as "", and with that the Sanity
 * client broke the build ("Configuration must contain `projectId`").
 */
export const SANITY_PROJECT_ID =
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "3rq1799s";

export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
