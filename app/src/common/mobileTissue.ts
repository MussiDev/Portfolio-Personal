/**
 * Geometría del tejido 2D de mobile. Puro y determinista: mismas entradas,
 * mismo tejido siempre — sin esto, cada render produciría una nube distinta
 * y los nodos de sección saltarían de lugar entre navegaciones.
 *
 * Separado del componente por la misma razón que `tissueReveal`: un canvas
 * no se puede testear sin DOM, pero esto sí.
 *
 * NO es una proyección del cerebro 3D. El .bin pesa 466 KB y descargarlo en
 * mobile es exactamente lo que se decidió no hacer; esto genera una nube
 * propia con la misma gramática visual (puntos densos hacia el borde,
 * aristas cortas entre vecinos) a costo cero de red.
 */

/** PRNG determinista. Math.random() haría que el tejido cambie en cada
 * mount y que SSR y cliente no coincidan. */
const mulberry32 = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Silueta lobulada: un círculo con tres armónicos. No dibuja un cerebro
 * anatómico — dibuja algo orgánico y asimétrico, que es lo que hace que no
 * se lea como "un círculo de puntos". */
const radiusAt = (angle: number): number =>
	0.5 *
	(1 + 0.13 * Math.sin(3 * angle) + 0.09 * Math.cos(5 * angle) - 0.11 * Math.cos(angle));

export type Tissue = {
	/** Pares x,y normalizados a [0,1]. */
	points: Float32Array;
	/** Pares x,y, dos por segmento (v0,v1,v0,v1…), como los buffers de aristas
	 * del cerebro 3D: permite crecer el dibujo con un solo contador. */
	edges: Float32Array;
	/** Índice dentro de `points` del nodo de cada sección — el equivalente 2D
	 * de SNAPPED_ANCHORS: el nodo está SOBRE el tejido, no flotando encima. */
	nodes: number[];
};

// Aristas cortas y tres vecinos por punto: con aristas largas y dos vecinos
// el resultado eran cadenas sueltas en zigzag — una constelación, no un
// tejido. Lo que hace que se lea como tejido es la malla local densa.
const MAX_EDGE_LENGTH = 0.05;
const NEIGHBOURS_PER_POINT = 3;

/** La nube ocupa el 82% del cuadrado normalizado, centrada. Llegando hasta
 * el borde, la silueta lobulada no se percibe: se ve un rectángulo lleno de
 * puntos, cortado por los lados de la pantalla. */
const FILL = 0.82;

export const buildTissue = (
	pointCount: number,
	nodeCount: number,
	seed = 0x5e17,
): Tissue => {
	const random = mulberry32(seed);
	const xs: number[] = [];
	const ys: number[] = [];

	// Rejection sampling dentro de la silueta, con sesgo hacia el borde: un
	// relleno uniforme se ve como una mancha, la densidad creciente hacia el
	// perímetro se lee como tejido.
	let guard = 0;
	while (xs.length < pointCount && guard < pointCount * 200) {
		guard += 1;
		const x = random() * 2 - 1;
		const y = random() * 2 - 1;
		const r = Math.hypot(x, y);
		if (r === 0) continue;
		const limit = radiusAt(Math.atan2(y, x)) * 2;
		if (r > limit) continue;
		if (random() > 0.3 + 0.7 * (r / limit)) continue;
		xs.push(x * 0.5 * FILL + 0.5);
		ys.push(y * 0.5 * FILL + 0.5);
	}

	const points = new Float32Array(xs.length * 2);
	for (let i = 0; i < xs.length; i += 1) {
		points[i * 2] = xs[i];
		points[i * 2 + 1] = ys[i];
	}

	// Aristas cortas a vecinos cercanos. O(n²) a propósito: corre una sola
	// vez, con n en el orden de las centenas, y un quadtree acá sería
	// complejidad comprada sin necesidad.
	const seen = new Set<number>();
	const edgeList: number[] = [];
	// Distancias al cuadrado: comparar d² contra maxD² da el mismo orden y el
	// mismo filtro que comparar distancias, sin pagar ~800k raíces cuadradas
	// en el hilo principal durante la hidratación.
	const maxDistSq = MAX_EDGE_LENGTH * MAX_EDGE_LENGTH;
	for (let i = 0; i < xs.length; i += 1) {
		const near: { j: number; d: number }[] = [];
		for (let j = 0; j < xs.length; j += 1) {
			if (i === j) continue;
			const dx = xs[i] - xs[j];
			const dy = ys[i] - ys[j];
			const d = dx * dx + dy * dy;
			if (d > maxDistSq) continue;
			near.push({ j, d });
		}
		near.sort((a, b) => a.d - b.d);
		for (const { j } of near.slice(0, NEIGHBOURS_PER_POINT)) {
			const key = i < j ? i * xs.length + j : j * xs.length + i;
			if (seen.has(key)) continue;
			seen.add(key);
			edgeList.push(xs[i], ys[i], xs[j], ys[j]);
		}
	}

	// Farthest-point sampling: reparte los nodos de sección por todo el
	// tejido en vez de amontonarlos donde la nube quedó más densa.
	const nodes: number[] = [];
	if (xs.length) {
		let best = 0;
		let bestD = Infinity;
		for (let i = 0; i < xs.length; i += 1) {
			const d = Math.hypot(xs[i] - 0.5, ys[i] - 0.5);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		nodes.push(best);
		while (nodes.length < nodeCount && nodes.length < xs.length) {
			let far = 0;
			let farD = -1;
			for (let i = 0; i < xs.length; i += 1) {
				if (nodes.includes(i)) continue;
				let minD = Infinity;
				for (const n of nodes) {
					const d = Math.hypot(xs[i] - xs[n], ys[i] - ys[n]);
					if (d < minD) minD = d;
				}
				if (minD > farD) {
					farD = minD;
					far = i;
				}
			}
			nodes.push(far);
		}
	}

	// Ordenados de arriba hacia abajo: el nodo 0 es el más alto del tejido y
	// el último el más bajo, igual que el orden del <nav> que va debajo. El
	// farthest-point sampling reparte bien pero devuelve un orden arbitrario,
	// y un nodo "01" que aparece abajo de todo contradice la lista.
	nodes.sort((a, b) => ys[a] - ys[b]);

	return { points, edges: new Float32Array(edgeList), nodes };
};
