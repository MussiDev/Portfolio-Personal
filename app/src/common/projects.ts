import projects from "../../../api/projects.json";
import { DEFAULT_LANGUAGE, type Language } from "../../../entities/i18n";
import Project, { ProjectStatus } from "../../../entities/project";
import { ProjectsSchema } from "../../../entities/schemas";

// Parsed once at module load, like every other api/*.json. The annotation is
// the contract: if the schema and the Project interface drift apart, tsc
// fails here instead of a cast hiding it.
const PROJECTS: Project[] = ProjectsSchema.parse(projects);

export const getProjects = (): Project[] =>
	PROJECTS.slice().sort((a, b) => a.weight - b.weight);

export const getProject = (slug: string): Project | undefined =>
	PROJECTS.find((m) => m.slug === slug);

export const STATUS_LABEL: Record<ProjectStatus, Record<Language, string>> = {
	"in-progress": { es: "En construcción", en: "Under construction" },
	"in-testing": { es: "En prueba", en: "In testing" },
	done: { es: "Terminado", en: "Finished" },
};

type Stage = Project["stages"][keyof Project["stages"]];

export const stageHasContent = (stage: Stage): boolean => {
	if ((stage.paragraphs[DEFAULT_LANGUAGE] ?? []).length > 0) return true;
	if ("measurements" in stage && stage.measurements.length > 0) return true;
	if ("diagram" in stage && stage.diagram) return true;
	if ("code" in stage && stage.code) return true;
	if ("flow" in stage && stage.flow) return true;
	return false;
};

export const stagesWritten = (m: Project): number =>
	Object.values(m.stages).filter(stageHasContent).length;

export const paragraphs = (stage: { paragraphs: Record<string, string[]> }, lang: Language) =>
	stage.paragraphs[lang]?.length ? stage.paragraphs[lang] : (stage.paragraphs[DEFAULT_LANGUAGE] ?? []);

export const STAGES = [
	{ key: "problem", label: { es: "Problema", en: "Problem" } },
	{ key: "decision", label: { es: "Decisión", en: "Decision" } },
	{ key: "mechanism", label: { es: "Mecanismo", en: "Mechanism" } },
	{ key: "tradeoff", label: { es: "Trade-off", en: "Trade-off" } },
	{ key: "result", label: { es: "Resultado", en: "Result" } },
	{ key: "after", label: { es: "Después", en: "Afterwards" } },
] as const;
