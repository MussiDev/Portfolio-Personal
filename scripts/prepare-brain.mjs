import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const INPUT = "assets/brain_areas.glb";
const OUTPUT_DIR = "public/image";
const OUTPUT_PREFIX = "cerebro";
const GENERATED_CONST = "app/src/common/brainAsset.ts";

const POINTS = 9000;
const EDGE_THRESHOLD = 22;

const buf = fs.readFileSync(INPUT);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

new GLTFLoader().parse(
	ab,
	"",
	(gltf) => {
		const model = gltf.scene;
		const box = new THREE.Box3().setFromObject(model);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());
		model.position.sub(center);
		model.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
		model.updateMatrixWorld(true);

		const points = [];
		const edges = [];

		model.traverse((child) => {
			if (!child.isMesh || !child.geometry) return;
			const geo = child.geometry.clone();
			geo.applyMatrix4(child.matrixWorld);

			const attr = geo.getAttribute("position");
			const stride = Math.max(1, Math.round(attr.count / POINTS));
			for (let i = 0; i < attr.count; i += stride) {
				points.push(attr.getX(i), attr.getY(i), attr.getZ(i));
			}

			const edge = new THREE.EdgesGeometry(geo, EDGE_THRESHOLD);
			const ep = edge.getAttribute("position");
			for (let i = 0; i < ep.count; i += 1) {
				edges.push(ep.getX(i), ep.getY(i), ep.getZ(i));
			}
			edge.dispose();
			geo.dispose();
		});

		const all = points.concat(edges);
		const min = [Infinity, Infinity, Infinity];
		const max = [-Infinity, -Infinity, -Infinity];
		for (let i = 0; i < all.length; i += 3) {
			for (let e = 0; e < 3; e += 1) {
				const v = all[i + e];
				if (v < min[e]) min[e] = v;
				if (v > max[e]) max[e] = v;
			}
		}
		const range = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);

		const pointCount = points.length / 3;
		const edgeCount = edges.length / 3;
		const HEADER_SIZE = 32;
		const output = Buffer.alloc(HEADER_SIZE + all.length * 2);

		output.write("CRB1", 0, "ascii");
		output.writeUInt32LE(pointCount, 4);
		output.writeUInt32LE(edgeCount, 8);
		output.writeFloatLE(min[0], 12);
		output.writeFloatLE(min[1], 16);
		output.writeFloatLE(min[2], 20);
		output.writeFloatLE(range, 24);

		for (let i = 0; i < all.length; i += 1) {
			const q = Math.round(((all[i] - min[i % 3]) / range) * 65535);
			output.writeUInt16LE(Math.min(65535, Math.max(0, q)), HEADER_SIZE + i * 2);
		}

		// Nombre con hash de contenido: permite servir el .bin con caché
		// inmutable de un año (next.config.js) sin arriesgar servir un
		// binario viejo la próxima vez que el modelo cambie.
		const hash = crypto.createHash("sha256").update(output).digest("hex").slice(0, 10);
		const filename = `${OUTPUT_PREFIX}.${hash}.bin`;
		const outputPath = path.join(OUTPUT_DIR, filename);

		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
		for (const f of fs.readdirSync(OUTPUT_DIR)) {
			if (f.startsWith(`${OUTPUT_PREFIX}.`) && f.endsWith(".bin") && f !== filename) {
				fs.unlinkSync(path.join(OUTPUT_DIR, f));
			}
		}
		fs.writeFileSync(outputPath, output);

		fs.writeFileSync(
			GENERATED_CONST,
			"// Generado por scripts/prepare-brain.mjs — no editar a mano.\n" +
				`export const BRAIN_BIN_PATH = "/image/${filename}";\n`,
		);

		const before = fs.statSync(INPUT).size;
		const after = output.length;
		const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";
		console.log(`points:  ${pointCount}`);
		console.log(`edges:   ${edgeCount / 2} segments (${edgeCount} vertices)`);
		console.log(`before:  ${kb(before)}  (${INPUT})`);
		console.log(`after:   ${kb(after)}  (${outputPath})`);
		console.log(`savings: ${(100 - (after / before) * 100).toFixed(1)}%`);
	},
	(e) => {
		console.error("Could not parse the GLB:", e);
		process.exit(1);
	},
);
