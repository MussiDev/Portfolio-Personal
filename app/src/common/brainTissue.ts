import * as THREE from "three";

import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat";
import { seedRegionMarkers } from "./brainDensity";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * Construye el tejido del cerebro a partir del buffer descargado y lo
 * revela: primero los puntos, después las aristas tendiéndose encima.
 *
 * Vivía dentro del `.then()` del fetch en Brain3D, mezclado con el bloom,
 * el readout de texto y el aviso de onReady. Eran tres responsabilidades en
 * el mismo callback: construir geometría, animar y coordinar el velo del
 * hero.
 *
 * Acá queda solo la primera y la segunda; quién se entera de que terminó es
 * problema de quien llama, vía `alTerminar`.
 */

const REVEAL_MS = 900;

/**
 * How far from a region's anchor its marks may be drawn, in model units —
 * the model is normalised so its longest side is 2, so this is roughly a
 * sixth of the brain. Wide enough that nineteen certifications read as a
 * cluster, tight enough that the cluster still belongs to one region.
 */
const REGION_SPREAD = 0.35;

const TISSUE = new THREE.Color(0x7c98be);
const IMPULSE = new THREE.Color(0xff6a3a);

export type Tejido = {
	/** Posiciones de los puntos, para que quien quiera pueda sembrar cosas
	 * sobre el tejido sin volver a parsear el buffer. */
	readonly posiciones: Float32Array;
	/** Cuántas marcas quedaron en cada región, en el orden de los anchors.
	 * Es el conteo real colocado, no el pedido: lo que el readout muestra
	 * es lo que se puede contar en pantalla. */
	readonly marcasPorRegion: readonly number[];
	/** Actualiza el color de las chispas espontáneas. No hace nada con
	 * reduced-motion ni antes de que el tejido termine de construirse. */
	latir: (frame: number) => void;
	/** Corta el reveal si el componente se desmonta a mitad de la animación. */
	cancelar: () => void;
};

/**
 * @param alTerminar se llama una sola vez, cuando el tejido está completo.
 * @param sigueVivo evita seguir animando (y avisar) tras el desmontaje.
 */
export const construirTejido = (
	group: THREE.Group,
	buffer: ArrayBuffer,
	{
		reducedMotion,
		sigueVivo,
		alTerminar,
		anchors,
		evidence,
	}: {
		reducedMotion: boolean;
		sigueVivo: () => boolean;
		alTerminar: () => void;
		/** Los centros de las seis regiones, ya snapeados al tejido. */
		anchors: readonly (readonly [number, number, number])[];
		/** Cuántos items reales respalda cada región, en el mismo orden. */
		evidence: readonly number[];
	},
): Tejido => {
	const { pointCount, edgeCount, min, range } = parseBinHeader(buffer);
	const raw = new Uint16Array(buffer, BIN_HEADER_SIZE);

	const posiciones = unpackVectors(raw, 0, pointCount, min, range);
	const aristas = unpackVectors(raw, pointCount * 3, edgeCount, min, range);

	const geoAristas = new THREE.BufferGeometry();
	geoAristas.setAttribute("position", new THREE.BufferAttribute(aristas, 3));
	group.add(
		new THREE.LineSegments(
			geoAristas,
			new THREE.LineBasicMaterial({
				color: TISSUE,
				transparent: true,
				opacity: 0.14,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		),
	);

	const nube = new THREE.BufferGeometry();
	nube.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
	group.add(
		new THREE.Points(
			nube,
			new THREE.PointsMaterial({
				color: TISSUE,
				size: 0.008,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.6,
				depthWrite: false,
			}),
		),
	);

	// El tejido se construye a la vista: drawRange crece sin tocar los
	// buffers ya parseados. Con reduced-motion salta al estado final.
	nube.setDrawRange(0, reducedMotion ? pointCount : 0);
	geoAristas.setDrawRange(0, reducedMotion ? edgeCount : 0);

	// Las marcas de cada región, sobre puntos reales del tejido. Antes eran
	// 120 chispas sembradas al azar: se veía vivo y no decía nada. Ahora hay
	// una marca por item contable — una empresa, un proyecto, un tiempo
	// escrito del caso, una recomendación, una nota, una certificación — así
	// que la densidad de una región se puede contrastar con la sección que
	// indica.
	const { positions: posChispas, region: regionDe, perRegion: marcasPorRegion } =
		seedRegionMarkers(posiciones, anchors, evidence, REGION_SPREAD);
	const marcas = regionDe.length;
	const colChispas = new Float32Array(marcas * 3);
	// La fase del destello sale del índice de la marca dentro de su región,
	// no de Math.random: la misma región parpadea igual en cada visita, y dos
	// marcas vecinas nunca laten al unísono.
	const fases: number[] = [];
	for (let i = 0, r = -1, k = 0; i < marcas; i += 1) {
		if (regionDe[i] !== r) {
			r = regionDe[i];
			k = 0;
		}
		fases.push(((k += 1) * 2.399963) % (Math.PI * 2));
	}
	const geoChispas = new THREE.BufferGeometry();
	geoChispas.setAttribute("position", new THREE.BufferAttribute(posChispas, 3));
	geoChispas.setAttribute("color", new THREE.BufferAttribute(colChispas, 3));
	const chispas = new THREE.Points(
		geoChispas,
		new THREE.PointsMaterial({
			size: 0.03,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0.95,
			vertexColors: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	chispas.visible = reducedMotion;
	group.add(chispas);

	const colorAux = new THREE.Color();
	/**
	 * El color de una marca para un pico de destello dado (0..1).
	 *
	 * Las marcas tienen piso: en reposo ya son un punto cálido, más claro
	 * que el tejido. Antes el piso era 0.25 del azul del tejido y el
	 * destello iba a pow(f, 7) — brevísimo —, así que en cualquier instante
	 * se veían cinco o seis marcas de las 43. Como ambiente funcionaba;
	 * como conteo no: una región de 19 certificaciones que muestra dos
	 * puntos no se puede contar, que es justo lo que esta tanda promete.
	 */
	const colorDeMarca = (pico: number) =>
		colorAux
			.copy(TISSUE)
			.lerp(IMPULSE, 0.45 + pico * 0.55)
			.multiplyScalar(0.85 + pico * 0.9);

	// Con reduced-motion no hay latido, así que el color se escribe una vez
	// acá. Sin esto las marcas quedaban en el negro con el que nace el
	// buffer de color: invisibles justo para quien pidió menos movimiento.
	if (reducedMotion) {
		const col = geoChispas.getAttribute("color") as THREE.BufferAttribute;
		for (let i = 0; i < marcas; i += 1) {
			colorDeMarca(0);
			col.setXYZ(i, colorAux.r, colorAux.g, colorAux.b);
		}
		col.needsUpdate = true;
	}

	let revealRaf = 0;
	if (reducedMotion) {
		// Dos frames: uno para que three.js suba las geometrías, otro para que
		// el primer render con el tejido completo ya esté en pantalla cuando se
		// levante el velo.
		requestAnimationFrame(() => requestAnimationFrame(alTerminar));
	} else {
		const inicio = performance.now();
		const paso = (ahora: number) => {
			if (!sigueVivo()) return;
			const t = Math.min(1, (ahora - inicio) / REVEAL_MS);
			const { points, edges } = revealCounts(easeOutCubic(t), pointCount, edgeCount);
			nube.setDrawRange(0, points);
			geoAristas.setDrawRange(0, edges);

			if (t < 1) {
				revealRaf = requestAnimationFrame(paso);
				return;
			}
			nube.setDrawRange(0, pointCount);
			geoAristas.setDrawRange(0, edgeCount);
			chispas.visible = true;
			alTerminar();
		};
		revealRaf = requestAnimationFrame(paso);
	}

	return {
		posiciones,
		marcasPorRegion,
		latir: (frame) => {
			if (reducedMotion || !chispas.visible) return;
			const col = geoChispas.getAttribute("color") as THREE.BufferAttribute;
			for (let i = 0; i < marcas; i += 1) {
				// pow(f, 7) da destellos breves y separados en vez de un latido
				// uniforme: el tejido parece disparar, no respirar.
				const f = (Math.sin(frame / 42 + fases[i]) + 1) / 2;
				const pico = f ** 7;
				colorDeMarca(pico);
				col.setXYZ(i, colorAux.r, colorAux.g, colorAux.b);
			}
			col.needsUpdate = true;
		},
		cancelar: () => {
			if (revealRaf) cancelAnimationFrame(revealRaf);
		},
	};
};
