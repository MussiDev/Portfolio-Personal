import type { Section } from "./Brain3D";

/**
 * Los índices de las secciones vinculadas a `i`.
 *
 * `Section.related` se declara en una sola dirección en algunos casos
 * (NorteAR apunta a Trayectoria porque comparten stack; la relación es
 * mutua, pero está escrita una vez). Leerla en un solo sentido hacía que el
 * panel del hero y las etiquetas resaltadas pudieran mostrar conjuntos
 * distintos para la misma sección — la clase de inconsistencia que el
 * usuario nota aunque no sepa nombrarla.
 *
 * Función pura y compartida: el cerebro la usa para decidir qué iluminar y
 * NervousSystem para decidir qué nombrar. Una sola definición de "conectado".
 */
export const relatedTo = (sections: Section[], i: number | null): number[] => {
	if (i === null || !sections[i]) return [];

	const vinculadas = new Set<number>(sections[i].related ?? []);
	sections.forEach((section, j) => {
		if (section.related?.includes(i)) vinculadas.add(j);
	});
	vinculadas.delete(i);

	// Ordenado para que el panel siempre nombre en el mismo orden, sin
	// depender de en qué sección se declaró la relación.
	return [...vinculadas]
		.filter((j) => j >= 0 && j < sections.length)
		.sort((a, b) => a - b);
};
