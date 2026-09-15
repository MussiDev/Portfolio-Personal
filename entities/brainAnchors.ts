/**
 * Puntos semilla en el espacio del modelo 3D, uno por región del cerebro
 * (mismo orden que `sections` en page.tsx). Son coordenadas editoriales
 * aproximadas — scripts/prepare-brain.mjs las snapea al punto de tejido
 * más cercano en build time y hornea el resultado en brainAsset.ts, así
 * Brain3D.tsx no tiene que recorrer la nube de puntos en el cliente.
 */
export const RAW_ANCHORS: readonly [number, number, number][] = [
	[0, 0.8, 0.02],
	[0, 0.34, 0.7],
	[0, -0.12, 0.58],
	[0, -0.36, 0.44],
	[0, 0.46, -0.62],
	[0, -0.06, -0.8],
];
