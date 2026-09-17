import * as THREE from "three";

import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat";
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
const SPONTANEOUS = 120;

const TISSUE = new THREE.Color(0x7c98be);
const IMPULSE = new THREE.Color(0xff6a3a);

export type Tejido = {
	/** Posiciones de los puntos, para que quien quiera pueda sembrar cosas
	 * sobre el tejido sin volver a parsear el buffer. */
	readonly posiciones: Float32Array;
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
	}: {
		reducedMotion: boolean;
		sigueVivo: () => boolean;
		alTerminar: () => void;
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

	// Chispas espontáneas sembradas sobre puntos reales del tejido: no
	// afirman ninguna región concreta, son actividad de fondo.
	const totalPuntos = posiciones.length / 3;
	const posChispas = new Float32Array(SPONTANEOUS * 3);
	const colChispas = new Float32Array(SPONTANEOUS * 3);
	const fases: number[] = [];
	for (let i = 0; i < SPONTANEOUS; i += 1) {
		const k = Math.floor(Math.random() * totalPuntos) * 3;
		fases.push(Math.random() * Math.PI * 2);
		posChispas[i * 3] = posiciones[k];
		posChispas[i * 3 + 1] = posiciones[k + 1];
		posChispas[i * 3 + 2] = posiciones[k + 2];
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

	const colorAux = new THREE.Color();

	return {
		posiciones,
		latir: (frame) => {
			if (reducedMotion || !chispas.visible) return;
			const col = geoChispas.getAttribute("color") as THREE.BufferAttribute;
			for (let i = 0; i < SPONTANEOUS; i += 1) {
				// pow(f, 7) da destellos breves y separados en vez de un latido
				// uniforme: el tejido parece disparar, no respirar.
				const f = (Math.sin(frame / 42 + fases[i]) + 1) / 2;
				const pico = f ** 7;
				colorAux
					.copy(TISSUE)
					.lerp(IMPULSE, pico)
					.multiplyScalar(0.25 + pico);
				col.setXYZ(i, colorAux.r, colorAux.g, colorAux.b);
			}
			col.needsUpdate = true;
		},
		cancelar: () => {
			if (revealRaf) cancelAnimationFrame(revealRaf);
		},
	};
};
