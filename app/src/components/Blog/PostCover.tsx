import { coverFromTissue } from "../../common/postCover";
import { getTissue2D } from "../../common/tissue2dServer";

/**
 * La portada de una nota: un recorte del cerebro del sitio, en SVG.
 *
 * Reemplaza las ilustraciones de stock que venían de Sanity. Sale resuelta
 * en el HTML del server, así que no hay una imagen que descargar ni un LCP
 * que espere a la red — que era justo el problema que la portada anterior
 * obligaba a manejar con `priority` y `sizes`.
 *
 * Es decoración y lo dice: aria-hidden. Lo que la nota tiene para decir
 * está en el título y en el cuerpo, no acá.
 */

const ANCHO = 1200;
const ALTO = 380;

/**
 * Qué fracción del alto del cerebro entra en la portada.
 *
 * Con 0.38 entraba casi la silueta entera: se leía como un cerebro chiquito
 * y lejano, con medio recuadro en negro. Acá abajo el recorte es textura —
 * un pedazo de tejido bien de cerca, sin contorno reconocible — que es lo
 * que tiene que ser: material, no ilustración.
 */
const ZOOM = 0.2;

const PostCover = async ({ slug, tagCount }: { slug: string; tagCount: number }) => {
	const brain = await getTissue2D();
	if (!brain) return null;

	const { points, edges, marks } = coverFromTissue(brain, slug, {
		aspect: ANCHO / ALTO,
		zoom: ZOOM,
		markCount: tagCount,
	});

	const x = (v: number) => (v * ANCHO).toFixed(1);
	const y = (v: number) => (v * ALTO).toFixed(1);

	return (
		<div
			aria-hidden='true'
			className='relative mb-10 w-full overflow-hidden border border-sinapsis/30 bg-tejido-hondo'
		>
			<svg
				viewBox={`0 0 ${ANCHO} ${ALTO}`}
				className='block h-full w-full'
				role='presentation'
			>
				{/* Las aristas van primero y tenues: son el fondo sobre el que
				se leen los puntos, igual que en el cerebro de la home. */}
				<g stroke='rgb(var(--sinapsis))' strokeWidth={1.1} opacity={0.38}>
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
				<g fill='rgb(var(--sinapsis))' opacity={0.85}>
					{Array.from({ length: points.length / 2 }, (_, i) => (
						<circle key={i} cx={x(points[i * 2])} cy={y(points[i * 2 + 1])} r={2.4} />
					))}
				</g>
				{/* Una marca por tag, en el naranja del impulso: el mismo
				significado que en el cerebro — una marca, un item real. */}
				<g fill='rgb(var(--impulso))'>
					{Array.from({ length: marks.length / 2 }, (_, i) => (
						<circle key={i} cx={x(marks[i * 2])} cy={y(marks[i * 2 + 1])} r={5.5} />
					))}
				</g>
			</svg>
		</div>
	);
};

export default PostCover;
