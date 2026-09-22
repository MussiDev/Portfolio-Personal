/**
 * Seed points in the 3D model's space, one per brain region (same order
 * as `sections` in page.tsx). These are approximate editorial coordinates
 * — scripts/prepare-brain.mjs snaps them to the nearest tissue point at
 * build time and bakes the result into brainAsset.ts, so Brain3D.tsx
 * doesn't have to scan the point cloud on the client.
 */
export const RAW_ANCHORS: readonly [number, number, number][] = [
	[0, 0.8, 0.02],
	[0, 0.34, 0.7],
	[0, -0.12, 0.58],
	[0, -0.36, 0.44],
	[0, 0.46, -0.62],
	[0, -0.06, -0.8],
];
