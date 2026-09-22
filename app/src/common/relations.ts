import type { Section } from "./Brain3D";

/**
 * The indexes of the sections linked to `i`.
 *
 * `Section.related` is declared in only one direction in some cases
 * (NorteAR points to Career because they share a stack; the relationship
 * is mutual, but it's written once). Reading it in a single direction let
 * the hero's panel and the highlighted labels show different sets for the
 * same section — the kind of inconsistency a user notices even without
 * being able to name it.
 *
 * A pure, shared function: the brain uses it to decide what to light up
 * and NervousSystem to decide what to name. One single definition of
 * "connected".
 */
export const relatedTo = (sections: Section[], i: number | null): number[] => {
	if (i === null || !sections[i]) return [];

	const linked = new Set<number>(sections[i].related ?? []);
	sections.forEach((section, j) => {
		if (section.related?.includes(i)) linked.add(j);
	});
	linked.delete(i);

	// Sorted so the panel always names them in the same order, without
	// depending on which section declared the relationship.
	return [...linked]
		.filter((j) => j >= 0 && j < sections.length)
		.sort((a, b) => a - b);
};
