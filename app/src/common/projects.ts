import projects from "../../../api/projects.json";
import { DEFAULT_LANGUAGE, type Language } from "../../../entities/i18n";
import Project, { ProjectStatus } from "../../../entities/project";

export const getProjects = (): Project[] =>
	(projects as Project[]).slice().sort((a, b) => a.peso - b.peso);

export const getProject = (slug: string): Project | undefined =>
	(projects as Project[]).find((m) => m.slug === slug);

export const STATUS_LABEL: Record<ProjectStatus, Record<Language, string>> = {
	"en-construccion": { es: "En construcción", en: "Under construction" },
	"en-prueba": { es: "En prueba", en: "In testing" },
	terminado: { es: "Terminado", en: "Finished" },
};

type Stage = Project["tiempos"][keyof Project["tiempos"]];

export const stageHasContent = (stage: Stage): boolean => {
	if ((stage.parrafos[DEFAULT_LANGUAGE] ?? []).length > 0) return true;
	if ("medidas" in stage && stage.medidas.length > 0) return true;
	if ("diagrama" in stage && stage.diagrama) return true;
	if ("codigo" in stage && stage.codigo) return true;
	if ("flujo" in stage && stage.flujo) return true;
	return false;
};

export const stagesWritten = (m: Project): number =>
	Object.values(m.tiempos).filter(stageHasContent).length;

export const paragraphs = (stage: { parrafos: Record<string, string[]> }, lang: Language) =>
	stage.parrafos[lang]?.length ? stage.parrafos[lang] : (stage.parrafos[DEFAULT_LANGUAGE] ?? []);

export const STAGES = [
	{ key: "problema", label: { es: "Problema", en: "Problem" } },
	{ key: "decision", label: { es: "Decisión", en: "Decision" } },
	{ key: "mecanismo", label: { es: "Mecanismo", en: "Mechanism" } },
	{ key: "tradeoff", label: { es: "Trade-off", en: "Trade-off" } },
	{ key: "resultado", label: { es: "Resultado", en: "Result" } },
	{ key: "despues", label: { es: "Después", en: "Afterwards" } },
] as const;
