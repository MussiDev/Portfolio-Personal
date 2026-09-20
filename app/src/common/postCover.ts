import type { Brain2D } from "./brain2dFormat";

/**
 * La portada de una nota, recortada del propio tejido.
 *
 * Las cuatro notas traían ilustraciones de stock de Sanity: un cohete, unos
 * nodos azules, una captura de markdown. Cada una venía de un banco
 * distinto y ninguna tenía que ver con el material del resto del sitio —
 * el blog parecía otra web con el mismo header.
 *
 * Acá la portada es un recorte del cerebro que ya dibuja la home: los
 * mismos puntos y las mismas aristas, en una ventana distinta para cada
 * nota. No hay una imagen que descargar, no hay un banco de imágenes, y no
 * se puede elegir mal: el material es uno solo.
 *
 * El recorte lo decide el slug, no el azar. La misma nota muestra siempre
 * la misma región — la portada es parte de su identidad, no un adorno que
 * cambia en cada visita.
 *
 * Puro a propósito — nada de React ni de canvas acá — para poder testearlo.
 */

export type Cover = {
	/** Pares x,y en [0,1] sobre la ventana recortada. */
	readonly points: Float32Array;
	/** Cuádruplas ax,ay,bx,by en [0,1] sobre la ventana recortada. */
	readonly edges: Float32Array;
	/** Los puntos encendidos: uno por tag de la nota, con el mismo
	 * significado que las marcas del cerebro — una marca, un item real. */
	readonly marks: Float32Array;
};

/**
 * Hash estable de 32 bits (FNV-1a). No es criptográfico y no falta que lo
 * sea: solo tiene que dar el mismo número para el mismo slug en el server,
 * en el cliente y entre deploys.
 */
export const hashSeed = (seed: string): number => {
	let h = 0x811c9dc5;
	for (let i = 0; i < seed.length; i += 1) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
};

const dentro = (v: number, min: number, span: number) => v >= min && v <= min + span;

/**
 * @param aspect ancho sobre alto de la portada, en píxeles. La ventana se
 * calcula con el aspect real del cerebro para que el tejido no salga
 * estirado: una portada apaisada recorta una banda ancha y baja, no el
 * cerebro entero achatado.
 * @param zoom qué fracción del alto del cerebro entra en la portada. Más
 * chico es más cerca: se ven menos puntos y más grandes.
 * @param markCount cuántos puntos encendidos, normalmente los tags.
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
	// El ancho en coordenadas del cerebro: para que un recorte de `aspect`
	// píxeles no deforme el tejido, la ventana tiene que medir lo mismo en
	// unidades reales, y el eje x del cerebro está comprimido por su aspect.
	const w = Math.min(1, (aspect * h) / brain.aspect);

	const rng = hashSeed(seed);
	// El centro no se sortea en el rectángulo: el cerebro no llena su caja y
	// media ventana caería en el vacío. Se sortea un punto de tejido real y
	// la ventana se cuelga de ahí, así siempre hay algo que dibujar.
	const totalPoints = brain.points.length / 2;
	const centro = (rng % totalPoints) * 2;
	const x0 = Math.max(0, Math.min(1 - w, brain.points[centro] - w / 2));
	const y0 = Math.max(0, Math.min(1 - h, brain.points[centro + 1] - h / 2));

	const px = (v: number) => (v - x0) / w;
	const py = (v: number) => (v - y0) / h;

	const dentroPuntos: number[] = [];
	for (let i = 0; i < brain.points.length; i += 2) {
		if (dentro(brain.points[i], x0, w) && dentro(brain.points[i + 1], y0, h)) {
			dentroPuntos.push(px(brain.points[i]), py(brain.points[i + 1]));
		}
	}

	// Una arista entra si entran sus dos extremos. Recortarla a la mitad
	// dejaría segmentos que mueren en el borde apuntando a nada.
	const dentroAristas: number[] = [];
	for (let i = 0; i < brain.edges.length; i += 4) {
		const [ax, ay, bx, by] = [
			brain.edges[i],
			brain.edges[i + 1],
			brain.edges[i + 2],
			brain.edges[i + 3],
		];
		if (
			dentro(ax, x0, w) &&
			dentro(ay, y0, h) &&
			dentro(bx, x0, w) &&
			dentro(by, y0, h)
		) {
			dentroAristas.push(px(ax), py(ay), px(bx), py(by));
		}
	}

	// Las marcas se reparten por la ventana en vez de caer juntas: se toman
	// a paso fijo sobre los puntos que quedaron, con el mismo hash de
	// arranque, así dos notas con tres tags no dibujan el mismo triángulo.
	const marks: number[] = [];
	const disponibles = dentroPuntos.length / 2;
	if (disponibles > 0 && markCount > 0) {
		const cuantas = Math.min(markCount, disponibles);
		const paso = Math.max(1, Math.floor(disponibles / cuantas));
		for (let k = 0; k < cuantas; k += 1) {
			const i = ((rng + k * paso) % disponibles) * 2;
			marks.push(dentroPuntos[i], dentroPuntos[i + 1]);
		}
	}

	return {
		points: new Float32Array(dentroPuntos),
		edges: new Float32Array(dentroAristas),
		marks: new Float32Array(marks),
	};
};
