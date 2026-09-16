/**
 * Curva pura de la construcción del tejido: dado un progreso 0→1, cuántos
 * puntos y aristas mostrar. Separado de Brain3D.tsx (que no se puede testear
 * sin un contexto WebGL) para poder verificar la curva en sí — monótona,
 * dentro de rango, sin partir un segmento de arista a la mitad.
 *
 * Los puntos aparecen en el primer 70% del progreso; las aristas arrancan
 * al 25% y terminan al 100%, solapando con los puntos ("se tienden
 * después", no "después de que terminan los puntos").
 */
export const revealCounts = (
	t: number,
	pointCount: number,
	edgeCount: number,
): { points: number; edges: number } => {
	const clamped = Math.max(0, Math.min(1, t));

	const points = Math.floor(pointCount * Math.min(1, clamped / 0.7));

	const edgeT = Math.max(0, Math.min(1, (clamped - 0.25) / 0.75));
	// Los pares de vértices de una arista no pueden partirse a la mitad.
	const edges = Math.floor((edgeCount * edgeT) / 2) * 2;

	return { points, edges };
};

/** Ease-out cúbico: arranca rápido, se asienta suave — evita que la
 * construcción se sienta lineal/mecánica. */
export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
