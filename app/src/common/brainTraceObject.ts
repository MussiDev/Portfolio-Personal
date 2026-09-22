import * as THREE from "three";

import { traceHead, type Route } from "./brainTrace";

/**
 * The three.js side of the decision trace: the walked route as a line that
 * grows one segment per beat, with the impulse riding its head.
 *
 * The walk itself lives in brainTrace.ts, without three.js, so it can be
 * tested. What is here is only geometry and easing.
 */

const IMPULSE = new THREE.Color(0xff6a3a);

export type Trace = {
	/**
	 * @param beat index of the beat on screen, or null to retract the trace.
	 * @param settled 0..1, how settled the camera is on the region.
	 */
	draw: (beat: number | null, settled: number, frame: number) => void;
	destroy: () => void;
};

/**
 * @param parent the brain's group, NOT the scene: the route is in model
 * coordinates, so it has to inherit the group's rotation and position —
 * added to the scene it drew a path detached from the tissue it walked.
 */
export const createTrace = (
	parent: THREE.Object3D,
	route: Route,
	{ reducedMotion }: { reducedMotion: boolean },
): Trace => {
	const segments = route.length / 3 - 1;

	// The drawn copy: every vertex but the head is the route's; the head is
	// interpolated, so a segment can be half lit while its beat arrives.
	const drawn = new Float32Array(route.length);
	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.BufferAttribute(drawn, 3));
	const mat = new THREE.LineBasicMaterial({
		color: IMPULSE,
		transparent: true,
		opacity: 0,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	const line = new THREE.Line(geo, mat);
	line.frustumCulled = false;
	parent.add(line);

	const headGeo = new THREE.BufferGeometry();
	headGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
	const headMat = new THREE.PointsMaterial({
		color: IMPULSE,
		size: 0.05,
		sizeAttenuation: true,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});
	const head = new THREE.Points(headGeo, headMat);
	head.frustumCulled = false;
	parent.add(head);

	const headPos = new Float32Array(3);
	let shown = 0;

	return {
		draw: (beat, settled, frame) => {
			// One segment per beat read: beat 0 lights the first.
			const target = beat === null ? 0 : Math.min(segments, beat + 1);
			shown += (target - shown) * (reducedMotion ? 1 : 0.07);

			const visible = Math.max(0, Math.min(segments, shown));
			const lastWhole = Math.floor(visible);
			for (let i = 0; i <= lastWhole; i++) {
				drawn[i * 3] = route[i * 3];
				drawn[i * 3 + 1] = route[i * 3 + 1];
				drawn[i * 3 + 2] = route[i * 3 + 2];
			}
			traceHead(route, visible, headPos);
			// The head vertex closes the drawn polyline, so a partially lit
			// segment stops where the head is instead of snapping forward.
			const headIndex = Math.min(lastWhole + 1, segments);
			drawn[headIndex * 3] = headPos[0];
			drawn[headIndex * 3 + 1] = headPos[1];
			drawn[headIndex * 3 + 2] = headPos[2];
			geo.getAttribute("position").needsUpdate = true;
			geo.setDrawRange(0, headIndex + 1);

			const wanted = visible > 0.02 ? 0.85 * settled : 0;
			mat.opacity += (wanted - mat.opacity) * 0.12;

			const hp = headGeo.getAttribute("position") as THREE.BufferAttribute;
			hp.setXYZ(0, headPos[0], headPos[1], headPos[2]);
			hp.needsUpdate = true;
			const beatPulse = reducedMotion ? 1 : 0.75 + Math.sin(frame / 22) * 0.25;
			headMat.opacity += (wanted * beatPulse - headMat.opacity) * 0.14;
		},
		destroy: () => {
			parent.remove(line, head);
			geo.dispose();
			mat.dispose();
			headGeo.dispose();
			headMat.dispose();
		},
	};
};
