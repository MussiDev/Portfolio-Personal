import * as THREE from "three";

/**
 * The impulse's three markers: the axon (line from the brain's center to
 * the active region), the impulse (the point that travels along that line)
 * and the pin (the point that pulses over the region).
 *
 * They used to live loose in Brain3D's useEffect — three geometries and
 * three materials created up top, updated sixty lines below inside the
 * loop, with the trip's progress as one more closure variable. Together
 * they're one thing: "the signal heading to the active region".
 */

const IMPULSE = new THREE.Color(0xff6a3a);

const point = (size: number) => {
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
	const mat = new THREE.PointsMaterial({
		color: IMPULSE,
		size,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	return { geo, mat, object: new THREE.Points(geo, mat) };
};

export type Markers = {
	/** No active region: everything fades out and the trip resets to zero. */
	turnOff: () => void;
	/**
	 * Stretches the axon to `anchor`, pulses the pin and advances the
	 * impulse. Returns the trip's progress (0..1) so the SVG callout's pulse
	 * stays in sync with the 3D one.
	 */
	pointAt: (
		anchor: THREE.Vector3,
		originY: number,
		settled: number,
		frame: number,
	) => number;
};

export const createMarkers = (
	scene: THREE.Scene,
	{ reducedMotion }: { reducedMotion: boolean },
): Markers => {
	const axonGeo = new THREE.BufferGeometry();
	axonGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
	const axonMat = new THREE.LineBasicMaterial({
		color: IMPULSE,
		transparent: true,
		opacity: 0,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	scene.add(new THREE.Line(axonGeo, axonMat));

	const impulse = point(0.09);
	const pin = point(0.16);
	scene.add(impulse.object, pin.object);

	let progress = 0;

	return {
		turnOff: () => {
			axonMat.opacity += (0 - axonMat.opacity) * 0.1;
			impulse.mat.opacity += (0 - impulse.mat.opacity) * 0.1;
			pin.mat.opacity += (0 - pin.mat.opacity) * 0.1;
			progress = 0;
		},
		pointAt: (anchor, originY, settled, frame) => {
			const pos = axonGeo.getAttribute("position") as THREE.BufferAttribute;
			pos.setXYZ(0, 0, originY, 0);
			pos.setXYZ(1, anchor.x, anchor.y, anchor.z);
			pos.needsUpdate = true;
			axonMat.opacity += (0.5 * settled - axonMat.opacity) * 0.1;

			const pp = pin.geo.getAttribute("position") as THREE.BufferAttribute;
			pp.setXYZ(0, anchor.x, anchor.y, anchor.z);
			pp.needsUpdate = true;
			const beat = reducedMotion ? 0 : Math.sin(frame / 30) * 0.25;
			pin.mat.opacity += ((0.75 + beat) * settled - pin.mat.opacity) * 0.12;

			progress = reducedMotion ? 1 : (progress + 0.016) % 1;
			const ip = impulse.geo.getAttribute("position") as THREE.BufferAttribute;
			ip.setXYZ(
				0,
				anchor.x * progress,
				originY + (anchor.y - originY) * progress,
				anchor.z * progress,
			);
			ip.needsUpdate = true;
			impulse.mat.opacity =
				(reducedMotion ? 0.9 : Math.sin(progress * Math.PI)) * settled;

			return progress;
		},
	};
};
