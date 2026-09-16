/**
 * Matemática de layout del cerebro, sin three.js ni DOM.
 *
 * Son las dos cuentas que deciden qué ve el usuario — por dónde pasa la
 * línea que une una etiqueta con su región, y hacia dónde apunta la cámara
 * mientras se scrollea — y vivían sueltas dentro del useEffect de WebGL,
 * donde no se podían ejercitar sin una GPU. Acá son funciones puras.
 */

/** Cuánto se separa el codo de la etiqueta antes de girar hacia la región. */
const CODO = 26;

export type Caja = { left: number; right: number; top: number; height: number };
export type Origen = { left: number; top: number };

/**
 * Los tres puntos de la polilínea que va de una etiqueta a su región:
 * sale horizontal del borde de la etiqueta, hace un codo, y de ahí tira
 * recto al anclaje.
 *
 * `haciaLaDerecha` es para la columna izquierda, que sale por su borde
 * derecho; la columna derecha es espejada.
 */
export const puntosDelCallout = (
	etiqueta: Caja,
	anclaje: { x: number; y: number },
	origen: Origen,
	haciaLaDerecha: boolean,
): string => {
	const bx = (haciaLaDerecha ? etiqueta.right : etiqueta.left) - origen.left;
	const by = etiqueta.top + etiqueta.height / 2 - origen.top;
	const codo = haciaLaDerecha ? bx + CODO : bx - CODO;
	return `${bx},${by} ${codo},${by} ${anclaje.x},${anclaje.y}`;
};

/** Proyecta una coordenada normalizada de clip (-1..1) al píxel del canvas. */
export const aPantalla = (
	clip: { x: number; y: number },
	tamaño: { width: number; height: number },
): { x: number; y: number } => ({
	x: (clip.x * 0.5 + 0.5) * tamaño.width,
	y: (-clip.y * 0.5 + 0.5) * tamaño.height,
});

export type PesoDePaso = { index: number; peso: number };

/**
 * Cuánto "pesa" cada paso según qué fracción del viewport ocupa ahora mismo.
 *
 * La cámara no salta de una sección a la otra: apunta al promedio ponderado
 * de las regiones visibles, así que en la transición entre dos pasos mira a
 * un punto intermedio. `fuerza` es cuánta autoridad tiene ese promedio — con
 * el hero en pantalla es ~0 y la cámara vuelve a su posición de reposo.
 *
 * El umbral de 0.001 descarta pasos apenas asomados: sin él, un borde de un
 * píxel tironea la cámara de una sección que el usuario no está mirando.
 */
export const pesosVisibles = (
	pasos: { index: number; top: number; bottom: number }[],
	altoViewport: number,
): { pesos: PesoDePaso[]; total: number; fuerza: number } => {
	const pesos: PesoDePaso[] = [];
	let total = 0;

	for (const { index, top, bottom } of pasos) {
		const visible = Math.max(0, Math.min(bottom, altoViewport) - Math.max(top, 0));
		const peso = altoViewport > 0 ? visible / altoViewport : 0;
		if (peso <= 0.001) continue;
		pesos.push({ index, peso });
		total += peso;
	}

	return { pesos, total, fuerza: Math.min(1, total) };
};
