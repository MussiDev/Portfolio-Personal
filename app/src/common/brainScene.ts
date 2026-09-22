import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Owns the brain's WebGL scene.
 *
 * All of this used to live loose inside Brain3D's useEffect, mixed in with
 * the scroll-spy, the SVG callouts and the animation loop: ~90 lines of
 * render infrastructure that has nothing to do with the site's navigation,
 * but that had to be read to get to the part that does.
 *
 * It's an object, not a hook, on purpose. A hook would force returning a
 * dozen refs for the animation loop to read, which is worse than what was
 * there before. Here the lifecycle is explicit: create, measure, render,
 * destroy.
 */

const FOV = 38;
const MODEL_WIDTH = 2.6;
const Z_HERO = 3.6;

export type BrainScene = {
	readonly scene: THREE.Scene;
	readonly camera: THREE.PerspectiveCamera;
	/** The tissue's container. It moves and rotates; the scene doesn't. */
	readonly group: THREE.Group;
	readonly width: number;
	readonly height: number;
	/** Minimum Z for the model to fit the viewport's width. */
	readonly minZ: number;
	measure: () => void;
	/** Adds the bloom. See Brain3D: it's deferred until after the reveal
	 * because compiling its shaders costs seconds on a slow device. */
	turnOnBloom: () => void;
	render: () => void;
	destroy: () => void;
};

export const createBrainScene = (
	mount: HTMLElement,
	/** Called on every measurement with the new size, so whoever mounts the
	 * scene can sync whatever sits on top of it (the callouts SVG's viewBox). */
	onMeasure?: (width: number, height: number) => void,
): BrainScene => {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0.1, Z_HERO);

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	// On narrow screens the pixel ratio is capped: rasterizing cost grows
	// with the square of the ratio and the visual difference isn't noticeable.
	const narrow = window.matchMedia("(max-width: 767px)").matches;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.25 : 2));
	renderer.setClearColor(0x000000, 0);
	mount.appendChild(renderer.domElement);
	renderer.domElement.style.width = "100%";
	renderer.domElement.style.height = "100%";
	renderer.domElement.style.display = "block";

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));

	const group = new THREE.Group();
	group.position.y = -0.22;
	scene.add(group);

	let bloom: UnrealBloomPass | null = null;
	let width = 0;
	let height = 0;
	let minZ = 0;

	const measure = () => {
		const rect = mount.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		width = rect.width;
		height = rect.height;
		minZ =
			MODEL_WIDTH / (2 * Math.tan((FOV * Math.PI) / 360) * (width / height));
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
		composer.setSize(width, height);
		bloom?.resolution.set(width, height);
		onMeasure?.(width, height);
	};

	measure();
	camera.position.setZ(Math.max(Z_HERO, minZ));

	return {
		scene,
		camera,
		group,
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get minZ() {
			return minZ;
		},
		measure,
		turnOnBloom: () => {
			if (bloom) return;
			bloom = new UnrealBloomPass(
				new THREE.Vector2(width || 1, height || 1),
				0.5,
				0.8,
				0.3,
			);
			composer.addPass(bloom);
		},
		render: () => composer.render(),
		destroy: () => {
			bloom?.dispose();
			composer.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode === mount) {
				mount.removeChild(renderer.domElement);
			}
			scene.traverse((o) => {
				const m = o as THREE.Mesh;
				m.geometry?.dispose();
				const mat = m.material as THREE.Material | THREE.Material[] | undefined;
				if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
				else mat?.dispose();
			});
		},
	};
};
