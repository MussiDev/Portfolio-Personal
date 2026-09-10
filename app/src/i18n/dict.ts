import type { Idioma } from "../../../entities/i18n";

/**
 * Los textos de la interfaz. El contenido vive en los JSON; acá está solo
 * lo que el taller dice de sí mismo.
 */
const DICT = {
	es: {
		rol: "Software Engineer · FullStack en La Mutual de AMR · Rosario, AR",
		presentacion:
			"Construyo y modernizo productos web, desde la arquitectura hasta la implementación.",
		volverMesa: "Volver a la mesa",
		volverCuaderno: "Volver al cuaderno",
		abrir: "Abrir",
		nav: {
			maquinas: "Máquinas",
			cuaderno: "Cuaderno",
			oficio: "El oficio",
			contacto: "Contacto",
			cv: "CV",
		},
		campos: {
			rol: "Rol",
			en: "En",
			desde: "Desde",
			lugar: "Lugar",
			stack: "Stack",
			contexto: "Contexto",
			periodo: "Período",
			estado: "Estado",
			documento: "Documento",
			maquinas: "Máquinas",
			actualizado: "Actualizado",
			autor: "Autor",
			numero: "N.º",
			fecha: "Fecha",
			nota: "Nota",
			temas: "Temas",
			tiempos: "Tiempos",
			formacion: "Formación",
			trabajando: "Trabajando",
			empresas: "Empresas",
			certificaciones: "Certificaciones",
			recomendaciones: "Recomendaciones",
		},
		maquinas: {
			titulo: "Máquinas",
			glosa: "sistemas que construí o modernicé",
			bajada:
				"Cada una se abre en seis tiempos: problema, decisión, mecanismo, trade-off, resultado y qué haría distinto hoy.",
			sinAbrir: "sin abrir todavía",
			sinEscribir: "sin escribir",
			sinMedir: "sin medir",
			escritos: (n: number) => `${n} / 6 escritos`,
		},
		cuaderno: {
			titulo: "Cuaderno",
			glosa: "notas de laboratorio",
			bajada:
				"Hipótesis, experimento y resultado. Lo que aprendí probando, no lo que leí.",
			vacio: "El cuaderno todavía está en blanco.",
		},
		oficio: {
			titulo: "El oficio",
			glosa: "quién trabaja acá",
			bio: "Empecé Ingeniería en Sistemas en 2020 y la dejé en 2021. No fue abandono: fue una decisión sobre cómo quería aprender. Desde entonces me formo por mi cuenta y contra problemas reales — que es exactamente lo que hago en el trabajo todos los días.",
			trayectoria: "Trayectoria",
			trayectoriaGlosa: "las mismas máquinas, ordenadas por tiempo",
			credenciales: "Credenciales",
			credencialesGlosa: (n: number) => `${n} cursos, para quien los necesite`,
			autodidacta: "Autodidacta",
			desdeAnio: "desde 2022",
		},
		mesa: {
			experimento: "Experimento — hipótesis, prueba, resultado",
			bancoVacio: "[ Banco vacío ]",
			delCuaderno: "del cuaderno",
			leer: "leer",
			verAnterior: "versión anterior",
		},
	},
	en: {
		rol: "Software Engineer · FullStack at La Mutual de AMR · Rosario, AR",
		presentacion:
			"I build and modernise web products, from the architecture to the implementation.",
		volverMesa: "Back to the bench",
		volverCuaderno: "Back to the notebook",
		abrir: "Open",
		nav: {
			maquinas: "Machines",
			cuaderno: "Notebook",
			oficio: "The trade",
			contacto: "Contact",
			cv: "CV",
		},
		campos: {
			rol: "Role",
			en: "At",
			desde: "Since",
			lugar: "Based in",
			stack: "Stack",
			contexto: "Context",
			periodo: "Period",
			estado: "Status",
			documento: "Document",
			maquinas: "Machines",
			actualizado: "Updated",
			autor: "Author",
			numero: "No.",
			fecha: "Date",
			nota: "Note",
			temas: "Topics",
			tiempos: "Beats",
			formacion: "Training",
			trabajando: "Working",
			empresas: "Companies",
			certificaciones: "Certifications",
			recomendaciones: "Recommendations",
		},
		maquinas: {
			titulo: "Machines",
			glosa: "systems I built or modernised",
			bajada:
				"Each one opens in six beats: problem, decision, mechanism, trade-off, result and what I would do differently today.",
			sinAbrir: "not opened yet",
			sinEscribir: "not written",
			sinMedir: "not measured",
			escritos: (n: number) => `${n} / 6 written`,
		},
		cuaderno: {
			titulo: "Notebook",
			glosa: "lab notes",
			bajada:
				"Hypothesis, experiment and result. What I learned by trying, not by reading.",
			vacio: "The notebook is still blank.",
		},
		oficio: {
			titulo: "The trade",
			glosa: "who works here",
			bio: "I started Systems Engineering in 2020 and left in 2021. It was not giving up: it was a decision about how I wanted to learn. Since then I have taught myself against real problems — which is exactly what I do at work every day.",
			trayectoria: "Career",
			trayectoriaGlosa: "the same machines, ordered by time",
			credenciales: "Credentials",
			credencialesGlosa: (n: number) => `${n} courses, for whoever needs them`,
			autodidacta: "Self-taught",
			desdeAnio: "since 2022",
		},
		mesa: {
			experimento: "Experiment — hypothesis, test, result",
			bancoVacio: "[ Empty bench ]",
			delCuaderno: "from the notebook",
			leer: "read",
			verAnterior: "previous version",
		},
	},
};

export type Dict = (typeof DICT)["es"];

export const getDict = (lang: Idioma): Dict => DICT[lang];
