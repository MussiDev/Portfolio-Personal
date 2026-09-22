import * as THREE from "three";

import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat";
import { seedRegionMarkers } from "./brainDensity";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * Builds the brain tissue from the downloaded buffer and reveals it: first
 * the points, then the edges stretching over them.
 *
 * This used to live inside Brain3D's fetch `.then()`, mixed in with the
 * bloom, the text readout and the onReady callback. That was three
 * responsibilities in the same callback: building geometry, animating, and
 * coordinating the hero's veil.
 *
 * Only the first two stay here; who finds out it's done is the caller's
 * problem, via `onDone`.
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

export type Tissue = {
	/** Point positions, so anyone can seed things onto the tissue without
	 * re-parsing the buffer. */
	readonly positions: Float32Array;
	/** How many marks landed in each region, in the same order as the
	 * anchors. It's the count actually placed, not the count requested: what
	 * the readout shows is what can be counted on screen. */
	readonly marksPerRegion: readonly number[];
	/** Updates the color of the spontaneous sparks. Does nothing with
	 * reduced-motion or before the tissue finishes building. */
	pulse: (frame: number) => void;
	/** Cancels the reveal if the component unmounts mid-animation. */
	cancel: () => void;
};

/**
 * @param onDone called exactly once, when the tissue is complete.
 * @param stillAlive avoids continuing to animate (and to notify) after unmount.
 */
export const buildTissue = (
	group: THREE.Group,
	buffer: ArrayBuffer,
	{
		reducedMotion,
		stillAlive,
		onDone,
		anchors,
		evidence,
	}: {
		reducedMotion: boolean;
		stillAlive: () => boolean;
		onDone: () => void;
		/** The six regions' centers, already snapped to the tissue. */
		anchors: readonly (readonly [number, number, number])[];
		/** How many real items back each region, in the same order. */
		evidence: readonly number[];
	},
): Tissue => {
	const { pointCount, edgeCount, min, range } = parseBinHeader(buffer);
	const raw = new Uint16Array(buffer, BIN_HEADER_SIZE);

	const positions = unpackVectors(raw, 0, pointCount, min, range);
	const edgePositions = unpackVectors(raw, pointCount * 3, edgeCount, min, range);

	const edgeGeo = new THREE.BufferGeometry();
	edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
	group.add(
		new THREE.LineSegments(
			edgeGeo,
			new THREE.LineBasicMaterial({
				color: TISSUE,
				transparent: true,
				opacity: 0.14,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		),
	);

	const cloud = new THREE.BufferGeometry();
	cloud.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	group.add(
		new THREE.Points(
			cloud,
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

	// The tissue builds up in view: drawRange grows without touching the
	// already-parsed buffers. With reduced-motion it jumps to the final state.
	cloud.setDrawRange(0, reducedMotion ? pointCount : 0);
	edgeGeo.setDrawRange(0, reducedMotion ? edgeCount : 0);

	// One mark per region, over real tissue points. This used to be 120
	// sparks seeded at random: it looked alive and said nothing. Now there's
	// one mark per countable item — a company, a project, a written case
	// beat, a recommendation, a note, a certification — so a region's density
	// can be checked against the section it stands for.
	const { positions: sparkPositions, region: regionOf, perRegion: marksPerRegion } =
		seedRegionMarkers(positions, anchors, evidence, REGION_SPREAD);
	const markCount = regionOf.length;
	const sparkColors = new Float32Array(markCount * 3);
	// The flicker phase comes from the mark's index within its region, not
	// from Math.random: the same region flickers the same way on every visit,
	// and two neighboring marks never pulse in unison.
	const phases: number[] = [];
	for (let i = 0, r = -1, k = 0; i < markCount; i += 1) {
		if (regionOf[i] !== r) {
			r = regionOf[i];
			k = 0;
		}
		phases.push(((k += 1) * 2.399963) % (Math.PI * 2));
	}
	const sparkGeo = new THREE.BufferGeometry();
	sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
	sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));
	const sparks = new THREE.Points(
		sparkGeo,
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
	sparks.visible = reducedMotion;
	group.add(sparks);

	const auxColor = new THREE.Color();
	/**
	 * A mark's color for a given flicker peak (0..1).
	 *
	 * Marks have a floor: at rest they're already a warm point, lighter than
	 * the tissue. The floor used to be 0.25 of the tissue's blue and the
	 * flicker went to pow(f, 7) — very brief —, so at any instant only five
	 * or six of the 43 marks were visible. As ambience that worked; as a
	 * count it didn't: a region with 19 certifications showing two points
	 * can't be counted, which is exactly what this batch promises.
	 */
	const markColor = (peak: number) =>
		auxColor
			.copy(TISSUE)
			.lerp(IMPULSE, 0.45 + peak * 0.55)
			.multiplyScalar(0.85 + peak * 0.9);

	// With reduced-motion there's no pulse, so the color is written once
	// here. Without this the marks would stay in the black the color buffer
	// is born with: invisible for exactly the people who asked for less motion.
	if (reducedMotion) {
		const col = sparkGeo.getAttribute("color") as THREE.BufferAttribute;
		for (let i = 0; i < markCount; i += 1) {
			markColor(0);
			col.setXYZ(i, auxColor.r, auxColor.g, auxColor.b);
		}
		col.needsUpdate = true;
	}

	let revealRaf = 0;
	if (reducedMotion) {
		// Two frames: one for three.js to upload the geometries, another so
		// the first render with the complete tissue is already on screen
		// when the veil lifts.
		requestAnimationFrame(() => requestAnimationFrame(onDone));
	} else {
		const start = performance.now();
		const step = (now: number) => {
			if (!stillAlive()) return;
			const t = Math.min(1, (now - start) / REVEAL_MS);
			const { points, edges } = revealCounts(easeOutCubic(t), pointCount, edgeCount);
			cloud.setDrawRange(0, points);
			edgeGeo.setDrawRange(0, edges);

			if (t < 1) {
				revealRaf = requestAnimationFrame(step);
				return;
			}
			cloud.setDrawRange(0, pointCount);
			edgeGeo.setDrawRange(0, edgeCount);
			sparks.visible = true;
			onDone();
		};
		revealRaf = requestAnimationFrame(step);
	}

	return {
		positions,
		marksPerRegion,
		pulse: (frame) => {
			if (reducedMotion || !sparks.visible) return;
			const col = sparkGeo.getAttribute("color") as THREE.BufferAttribute;
			for (let i = 0; i < markCount; i += 1) {
				// pow(f, 7) gives brief, separated flickers instead of a uniform
				// pulse: the tissue looks like it's firing, not breathing.
				const f = (Math.sin(frame / 42 + phases[i]) + 1) / 2;
				const peak = f ** 7;
				markColor(peak);
				col.setXYZ(i, auxColor.r, auxColor.g, auxColor.b);
			}
			col.needsUpdate = true;
		},
		cancel: () => {
			if (revealRaf) cancelAnimationFrame(revealRaf);
		},
	};
};
