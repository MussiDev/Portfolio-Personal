import type { Brain2D } from "./brain2dFormat";

/**
 * A post's cover, cropped from the tissue itself.
 *
 * The four posts used to carry Sanity stock illustrations: a rocket, some
 * blue nodes, a markdown screenshot. Each came from a different bank and
 * none had anything to do with the rest of the site's material — the blog
 * looked like another site with the same header.
 *
 * Here the cover is a crop of the same brain the home draws: the same
 * points and the same edges, in a different window for each post. There's
 * no image to download, no image bank, and no way to pick badly: there's
 * only one material.
 *
 * The crop is decided by the slug, not by chance. The same post always
 * shows the same region — the cover is part of its identity, not a
 * decoration that changes on every visit.
 *
 * Pure on purpose — no React, no canvas here — so it can be tested.
 */

export type Cover = {
	/** x,y pairs in [0,1] over the cropped window. */
	readonly points: Float32Array;
	/** ax,ay,bx,by quadruples in [0,1] over the cropped window. */
	readonly edges: Float32Array;
	/** The lit points: one per post tag, with the same meaning as the
	 * brain's marks — one mark, one real item. */
	readonly marks: Float32Array;
};

/**
 * Stable 32-bit hash (FNV-1a). It isn't cryptographic and doesn't need to
 * be: it only has to give the same number for the same slug on the
 * server, on the client, and across deploys.
 */
export const hashSeed = (seed: string): number => {
	let h = 0x811c9dc5;
	for (let i = 0; i < seed.length; i += 1) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
};

const within = (v: number, min: number, span: number) => v >= min && v <= min + span;

/**
 * @param aspect the cover's width over height, in pixels. The window is
 * computed with the brain's real aspect so the tissue doesn't come out
 * stretched: a landscape cover crops a wide, short band, not the whole
 * brain squashed.
 * @param zoom what fraction of the brain's height fits in the cover.
 * Smaller is closer: fewer, bigger points are visible.
 * @param markCount how many lit points, normally the tags.
 */
export const coverFromTissue = (
	brain: Brain2D,
	seed: string,
	{
		aspect,
		zoom = 0.45,
		markCount = 0,
	}: { aspect: number; zoom?: number; markCount?: number },
): Cover => {
	const h = Math.min(1, zoom);
	// The width in the brain's coordinates: for an `aspect`-pixel crop to
	// not distort the tissue, the window has to measure the same in real
	// units, and the brain's x axis is compressed by its aspect ratio.
	const w = Math.min(1, (aspect * h) / brain.aspect);

	const rng = hashSeed(seed);
	// The center isn't rolled over the rectangle: the brain doesn't fill
	// its box and half the window would land in empty space. A real tissue
	// point is rolled instead and the window hangs off it, so there's
	// always something to draw.
	const totalPoints = brain.points.length / 2;
	const center = (rng % totalPoints) * 2;
	const x0 = Math.max(0, Math.min(1 - w, brain.points[center] - w / 2));
	const y0 = Math.max(0, Math.min(1 - h, brain.points[center + 1] - h / 2));

	const px = (v: number) => (v - x0) / w;
	const py = (v: number) => (v - y0) / h;

	const insidePoints: number[] = [];
	for (let i = 0; i < brain.points.length; i += 2) {
		if (within(brain.points[i], x0, w) && within(brain.points[i + 1], y0, h)) {
			insidePoints.push(px(brain.points[i]), py(brain.points[i + 1]));
		}
	}

	// An edge is included if both its ends are. Cropping it in half would
	// leave segments dying at the border, pointing at nothing.
	const insideEdges: number[] = [];
	for (let i = 0; i < brain.edges.length; i += 4) {
		const [ax, ay, bx, by] = [
			brain.edges[i],
			brain.edges[i + 1],
			brain.edges[i + 2],
			brain.edges[i + 3],
		];
		if (
			within(ax, x0, w) &&
			within(ay, y0, h) &&
			within(bx, x0, w) &&
			within(by, y0, h)
		) {
			insideEdges.push(px(ax), py(ay), px(bx), py(by));
		}
	}

	// The marks are spread across the window instead of falling together:
	// they're taken at a fixed stride over the points that remain, with the
	// same starting hash, so two posts with three tags don't draw the same
	// triangle.
	const marks: number[] = [];
	const available = insidePoints.length / 2;
	if (available > 0 && markCount > 0) {
		const howMany = Math.min(markCount, available);
		const stride = Math.max(1, Math.floor(available / howMany));
		for (let k = 0; k < howMany; k += 1) {
			const i = ((rng + k * stride) % available) * 2;
			marks.push(insidePoints[i], insidePoints[i + 1]);
		}
	}

	return {
		points: new Float32Array(insidePoints),
		edges: new Float32Array(insideEdges),
		marks: new Float32Array(marks),
	};
};
