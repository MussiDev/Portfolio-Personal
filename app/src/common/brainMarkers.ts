import * as THREE from "three";

/**
 * Los tres marcadores del impulso: el axón (línea del centro del cerebro a
 * la región activa), el impulso (el punto que viaja por esa línea) y el pin
 * (el punto que late sobre la región).
 *
 * Vivían sueltos en el useEffect de Brain3D — tres geometrías y tres
 * materiales creados arriba, actualizados sesenta líneas más abajo dentro
 * del loop, con el progreso del viaje como una variable más del closure.
 * Juntos son una sola cosa: "la señal que va hacia la región activa".
 */

const IMPULSO = new THREE.Color(0xff6a3a);

const punto = (tamaño: number) => {
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
	const mat = new THREE.PointsMaterial({
		color: IMPULSO,
		size: tamaño,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	return { geo, mat, objeto: new THREE.Points(geo, mat) };
};

export type Marcadores = {
	/** Sin región activa: todo se desvanece y el viaje vuelve a cero. */
	apagar: () => void;
	/**
	 * Tiende el axón hasta `anclaje`, hace latir el pin y avanza el impulso.
	 * Devuelve el progreso del viaje (0..1) para que el pulso del callout en
	 * SVG vaya sincronizado con el del 3D.
	 */
	apuntar: (
		anclaje: THREE.Vector3,
		origenY: number,
		asentado: number,
		frame: number,
	) => number;
};

export const crearMarcadores = (
	scene: THREE.Scene,
	{ reducedMotion }: { reducedMotion: boolean },
): Marcadores => {
	const axonGeo = new THREE.BufferGeometry();
	axonGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
	const axonMat = new THREE.LineBasicMaterial({
		color: IMPULSO,
		transparent: true,
		opacity: 0,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	scene.add(new THREE.Line(axonGeo, axonMat));

	const impulso = punto(0.09);
	const pin = punto(0.16);
	scene.add(impulso.objeto, pin.objeto);

	let progreso = 0;

	return {
		apagar: () => {
			axonMat.opacity += (0 - axonMat.opacity) * 0.1;
			impulso.mat.opacity += (0 - impulso.mat.opacity) * 0.1;
			pin.mat.opacity += (0 - pin.mat.opacity) * 0.1;
			progreso = 0;
		},
		apuntar: (anclaje, origenY, asentado, frame) => {
			const pos = axonGeo.getAttribute("position") as THREE.BufferAttribute;
			pos.setXYZ(0, 0, origenY, 0);
			pos.setXYZ(1, anclaje.x, anclaje.y, anclaje.z);
			pos.needsUpdate = true;
			axonMat.opacity += (0.5 * asentado - axonMat.opacity) * 0.1;

			const pp = pin.geo.getAttribute("position") as THREE.BufferAttribute;
			pp.setXYZ(0, anclaje.x, anclaje.y, anclaje.z);
			pp.needsUpdate = true;
			const latido = reducedMotion ? 0 : Math.sin(frame / 30) * 0.25;
			pin.mat.opacity += ((0.75 + latido) * asentado - pin.mat.opacity) * 0.12;

			progreso = reducedMotion ? 1 : (progreso + 0.016) % 1;
			const ip = impulso.geo.getAttribute("position") as THREE.BufferAttribute;
			ip.setXYZ(
				0,
				anclaje.x * progreso,
				origenY + (anclaje.y - origenY) * progreso,
				anclaje.z * progreso,
			);
			ip.needsUpdate = true;
			impulso.mat.opacity =
				(reducedMotion ? 0.9 : Math.sin(progreso * Math.PI)) * asentado;

			return progreso;
		},
	};
};
