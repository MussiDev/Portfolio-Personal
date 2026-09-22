import { coverFromTissue } from "../../common/postCover";
import { getTissue2D } from "../../common/tissue2dServer";

/**
 * A post's cover: a crop of the site's brain, in SVG.
 *
 * Replaces the stock illustrations that used to come from Sanity. It
 * comes out resolved in the server's HTML, so there's no image to
 * download and no LCP waiting on the network — which was exactly the
 * problem the previous cover forced handling with `priority` and `sizes`.
 *
 * It's decoration and says so: aria-hidden. What the post has to say is
 * in the title and the body, not here.
 */

const WIDTH = 1200;
const HEIGHT = 380;

/**
 * What fraction of the brain's height fits in the cover.
 *
 * At 0.38 almost the entire silhouette fit in: it read as a small, distant
 * brain, with half the frame in black. Down here the crop is texture — a
 * close-up piece of tissue with no recognizable outline — which is what it
 * should be: material, not illustration.
 */
const ZOOM = 0.2;

const PostCover = async ({ slug, tagCount }: { slug: string; tagCount: number }) => {
	const brain = await getTissue2D();
	if (!brain) return null;

	const { points, edges, marks } = coverFromTissue(brain, slug, {
		aspect: WIDTH / HEIGHT,
		zoom: ZOOM,
		markCount: tagCount,
	});

	const x = (v: number) => (v * WIDTH).toFixed(1);
	const y = (v: number) => (v * HEIGHT).toFixed(1);

	return (
		<div
			aria-hidden='true'
			className='relative mb-10 w-full overflow-hidden border border-synapse/30 bg-tissue-deep'
		>
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className='block h-full w-full'
				role='presentation'
			>
				{/* The edges go first and faint: they're the background the
				points get read against, just like the home's brain. */}
				<g stroke='rgb(var(--synapse))' strokeWidth={1.1} opacity={0.38}>
					{Array.from({ length: edges.length / 4 }, (_, i) => (
						<line
							key={i}
							x1={x(edges[i * 4])}
							y1={y(edges[i * 4 + 1])}
							x2={x(edges[i * 4 + 2])}
							y2={y(edges[i * 4 + 3])}
						/>
					))}
				</g>
				<g fill='rgb(var(--synapse))' opacity={0.85}>
					{Array.from({ length: points.length / 2 }, (_, i) => (
						<circle key={i} cx={x(points[i * 2])} cy={y(points[i * 2 + 1])} r={2.4} />
					))}
				</g>
				{/* One mark per tag, in the impulse's orange: the same meaning
				as on the brain — one mark, one real item. */}
				<g fill='rgb(var(--impulse))'>
					{Array.from({ length: marks.length / 2 }, (_, i) => (
						<circle key={i} cx={x(marks[i * 2])} cy={y(marks[i * 2 + 1])} r={5.5} />
					))}
				</g>
			</svg>
		</div>
	);
};

export default PostCover;
