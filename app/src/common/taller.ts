import machines from "../../../api/machines.json";
import { IDIOMA_POR_DEFECTO, type Idioma } from "../../../entities/i18n";
import Machine, { EstadoMaquina } from "../../../entities/machine";

/** Todas las máquinas, ordenadas por peso: la principal primero. */
export const getMachines = (): Machine[] =>
	(machines as Machine[]).slice().sort((a, b) => a.peso - b.peso);

export const getMachine = (slug: string): Machine | undefined =>
	(machines as Machine[]).find((m) => m.slug === slug);

export const ESTADO_LABEL: Record<EstadoMaquina, Record<Idioma, string>> = {
	"en-construccion": { es: "En construcción", en: "Under construction" },
	"en-prueba": { es: "En prueba", en: "In testing" },
	terminado: { es: "Terminado", en: "Finished" },
};

/** El estado se lee en color: lo que está en obra lleva la marca. */
export const estadoClass = (estado: EstadoMaquina): string =>
	estado === "terminado"
		? "border-linea text-linea"
		: "border-marca text-marca";

/**
 * Cuántos de los seis tiempos tienen texto escrito. Una máquina con cero
 * está en el registro pero todavía no se puede abrir: el registro lista
 * todo lo que hay sobre la mesa, incluso lo que no se documentó.
 */
export const tiemposEscritos = (m: Machine): number =>
	Object.values(m.tiempos).filter(
		(t) => (t.parrafos[IDIOMA_POR_DEFECTO] ?? []).length > 0,
	).length;

/** Los párrafos de un tiempo, con caída al español si falta la traducción. */
export const parrafos = (t: { parrafos: Record<string, string[]> }, lang: Idioma) =>
	t.parrafos[lang]?.length ? t.parrafos[lang] : (t.parrafos[IDIOMA_POR_DEFECTO] ?? []);

export const TIEMPOS = [
	{ clave: "problema", titulo: { es: "Problema", en: "Problem" } },
	{ clave: "decision", titulo: { es: "Decisión", en: "Decision" } },
	{ clave: "mecanismo", titulo: { es: "Mecanismo", en: "Mechanism" } },
	{ clave: "tradeoff", titulo: { es: "Trade-off", en: "Trade-off" } },
	{ clave: "resultado", titulo: { es: "Resultado", en: "Result" } },
	{ clave: "despues", titulo: { es: "Después", en: "Afterwards" } },
] as const;
