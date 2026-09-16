import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Dueño de la escena WebGL del cerebro.
 *
 * Todo esto vivía suelto dentro del useEffect de Brain3D, mezclado con el
 * scroll-spy, los callouts en SVG y el loop de animación: ~90 líneas de
 * infraestructura de render que no tienen nada que ver con la navegación
 * del sitio, pero que había que leer para llegar a la parte que sí.
 *
 * Es un objeto y no un hook a propósito. Un hook obligaría a devolver una
 * docena de refs para que el loop de animación los lea, que es peor que lo
 * que había. Acá el ciclo de vida es explícito: se crea, se mide, se
 * renderiza, se destruye.
 */

const FOV = 38;
const MODEL_WIDTH = 2.6;
const Z_HERO = 3.6;

export type EscenaDelCerebro = {
	readonly scene: THREE.Scene;
	readonly camera: THREE.PerspectiveCamera;
	/** Contenedor del tejido. Se mueve y rota; la escena no. */
	readonly group: THREE.Group;
	readonly ancho: number;
	readonly alto: number;
	/** Z mínima para que el modelo entre a lo ancho del viewport. */
	readonly zMinima: number;
	medir: () => void;
	/** Agrega el bloom. Ver Brain3D: se difiere hasta después del reveal
	 * porque compilar sus shaders cuesta segundos en un dispositivo lento. */
	encenderBloom: () => void;
	render: () => void;
	destruir: () => void;
};

export const crearEscenaDelCerebro = (
	mount: HTMLElement,
	/** Se llama en cada medición con el tamaño nuevo, para que quien monte la
	 * escena sincronice lo que tenga encima (el viewBox del SVG de callouts). */
	alMedir?: (ancho: number, alto: number) => void,
): EscenaDelCerebro => {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
	camera.position.set(0, 0.1, Z_HERO);

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	// En pantallas angostas se recorta el pixel ratio: el costo de rasterizar
	// crece con el cuadrado del ratio y la diferencia visual no se percibe.
	const angosta = window.matchMedia("(max-width: 767px)").matches;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, angosta ? 1.25 : 2));
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
	let ancho = 0;
	let alto = 0;
	let zMinima = 0;

	const medir = () => {
		const rect = mount.getBoundingClientRect();
		if (!rect.width || !rect.height) return;
		ancho = rect.width;
		alto = rect.height;
		zMinima =
			MODEL_WIDTH / (2 * Math.tan((FOV * Math.PI) / 360) * (ancho / alto));
		camera.aspect = ancho / alto;
		camera.updateProjectionMatrix();
		renderer.setSize(ancho, alto, false);
		composer.setSize(ancho, alto);
		bloom?.resolution.set(ancho, alto);
		alMedir?.(ancho, alto);
	};

	medir();
	camera.position.setZ(Math.max(Z_HERO, zMinima));

	return {
		scene,
		camera,
		group,
		get ancho() {
			return ancho;
		},
		get alto() {
			return alto;
		},
		get zMinima() {
			return zMinima;
		},
		medir,
		encenderBloom: () => {
			if (bloom) return;
			bloom = new UnrealBloomPass(
				new THREE.Vector2(ancho || 1, alto || 1),
				0.5,
				0.8,
				0.3,
			);
			composer.addPass(bloom);
		},
		render: () => composer.render(),
		destruir: () => {
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
