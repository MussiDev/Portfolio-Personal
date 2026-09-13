import type { Language } from "../../../entities/i18n";

const DICT = {
	es: {
		rol: "Frontend Engineer · Arquitectura frontend y performance",
		presentacion:
			"Hace más de cuatro años que trabajo en frontend, y lo que más me interesa es la parte que no se ve: las decisiones de arquitectura que definen si un sistema escala o se vuelve imposible de mantener.",
		disponibilidad: "Abierto a conversar sobre proyectos interesantes.",
		nav: {
			blog: "Blog",
			contacto: "Contacto",
			cv: "CV",
		},
		campos: {
			rol: "Rol",
			en: "En",
			desde: "Desde",
			lugar: "Lugar",
			stack: "Stack",
			recomendaciones: "Recomendaciones",
			idiomas: "Idiomas",
		},
		proyectos: {
			sinEscribir: "sin escribir",
			sinMedir: "sin medir",
		},
		blog: {
			titulo: "Blog",
			glosa: "notas de laboratorio",
			bajada:
				"Hipótesis, experimento y resultado. Lo que aprendí probando, no lo que leí.",
			vacio: "El blog todavía está en blanco.",
			volver: "Volver al blog",
		},
		sobreMi: {
			titulo: "Sobre mí",
			bio: [
				"Hace más de 4 años que trabajo en frontend, y lo que más me interesa es la parte que no se ve: las decisiones de arquitectura que definen si un sistema escala o se vuelve imposible de mantener.",
				"Hoy lidero las definiciones de arquitectura frontend sobre plataformas internas que usan miles de personas. El último rediseño que hice redujo un 35% los tiempos de carga.",
				"Trabajo sobre todo con Next.js, React y TypeScript. Cuando hace falta integro APIs .NET y servicios de backend, pero mi foco está en el frontend.",
				"Buena parte de lo que hago tiene que ver con sistemas que crecieron más de lo que su arquitectura original soportaba: migraciones de Angular y CSHTML a Next.js, sistemas de componentes reutilizables, y estándares de code review para que el equipo no repita los mismos errores.",
				"Empecé Ingeniería en Sistemas en 2020 y la dejé en 2021. No fue abandono: fue una decisión sobre cómo quería aprender. Desde entonces me formo por mi cuenta y contra problemas reales — que es exactamente lo que hago en el trabajo todos los días.",
			],
			trayectoria: "Trayectoria",
			trayectoriaGlosa: "los mismos proyectos, ordenados por tiempo",
			credenciales: "Credenciales",
		},
		hero: {
			rol: "Frontend Engineer · Arquitectura y performance · Remoto",
			abrir: "Abrir",
			volver: "Volver",
			cargando: "Cargando tejido",
			actividad: "regiones activas",
			bajar: "Bajar al registro",
			pasos: "Progreso del recorrido",
			navegacion: "Navegación principal",
			secciones: {
				proyectos:
					"Sistemas que construí o modernicé, abiertos en seis tiempos: problema, decisión, mecanismo, trade-off, resultado y qué haría distinto.",
				experiencia: "Dónde trabajé y qué construí ahí, ordenado por tiempo.",
				recomendaciones:
					"Lo que dijeron de trabajar conmigo quienes lo hicieron, con nombre, rol y relación.",
				blog: "Notas de laboratorio: hipótesis, experimento y resultado. Lo que aprendí probando.",
				contacto: "Para hablar de un puesto, un proyecto o una consulta puntual.",
				cv: "El currículum en PDF, por si necesitás el formato de siempre.",
			},
		},
		ui: {
			empresas: "empresas",
			proyectos: "proyectos",
			notas: "notas",
			personas: "personas",
			tiempos: "tiempos",
			cursos: "cursos",
			remoto: "Remoto",
			enRemoto: "en remoto",
			respuesta24h: "respuesta en 24 h",
			verMenos: "Ver menos",
			verProyectos: (n: number) => `Ver los ${n} proyectos`,
			margenDelDia: "Margen del día",
			formulaMargen: "$45.000 facturado − $4.900 en insumos = $40.100",
			verPanelCompleto: "Ver el panel completo",
			altMargen:
				"Margen de hoy: $40.100, el 89%, con la línea que lo explica: $45.000 facturado menos $4.900 en insumos.",
			altPanel:
				"Panel completo de NorteAR: caja del día, resumen del mes, ventas, turnos, alertas de stock y actividad reciente.",
			recomendacionesGlosa: "lo que dijeron quienes trabajaron conmigo",
			descartes: "Este sitio · lo que descarté",
		},
	},
	en: {
		rol: "Frontend Engineer · Frontend architecture & web performance",
		presentacion:
			"I've been working in frontend for over four years, and what interests me most is the part nobody sees: the architecture decisions that decide whether a system scales or becomes impossible to maintain.",
		disponibilidad: "Open to talking about interesting projects.",
		nav: {
			blog: "Blog",
			contacto: "Contact",
			cv: "CV",
		},
		campos: {
			rol: "Role",
			en: "At",
			desde: "Since",
			lugar: "Based in",
			stack: "Stack",
			recomendaciones: "Recommendations",
			idiomas: "Languages",
		},
		proyectos: {
			sinEscribir: "not written",
			sinMedir: "not measured",
		},
		blog: {
			titulo: "Blog",
			glosa: "lab notes",
			bajada:
				"Hypothesis, experiment and result. What I learned by trying, not by reading.",
			vacio: "The blog is still blank.",
			volver: "Back to the blog",
		},
		sobreMi: {
			titulo: "About me",
			bio: [
				"I've been working in frontend for over four years, and what interests me most is the part nobody sees: the architecture decisions that decide whether a system scales or becomes impossible to maintain.",
				"Today I lead frontend architecture decisions for internal platforms used by thousands of people. The last redesign I led cut load times by 35%.",
				"I work mostly with Next.js, React and TypeScript. When needed I integrate .NET APIs and backend services, but my focus stays on the frontend.",
				"Much of what I do involves systems that outgrew their original architecture: migrations from Angular and CSHTML to Next.js, reusable component systems, and code review standards so the team doesn't repeat the same mistakes.",
				"I started Systems Engineering in 2020 and left in 2021. It was not giving up: it was a decision about how I wanted to learn. Since then I have taught myself against real problems — which is exactly what I do at work every day.",
			],
			trayectoria: "Career",
			trayectoriaGlosa: "the same projects, ordered by time",
			credenciales: "Credentials",
		},
		hero: {
			rol: "Frontend Engineer · Architecture & performance · Remote",
			abrir: "Open",
			volver: "Back",
			cargando: "Loading tissue",
			actividad: "active regions",
			bajar: "Down to the record",
			pasos: "Walkthrough progress",
			navegacion: "Main navigation",
			secciones: {
				proyectos:
					"Systems I built or modernised, opened in six beats: problem, decision, mechanism, trade-off, result and what I would do differently.",
				experiencia: "Where I worked and what I built there, ordered by time.",
				recomendaciones:
					"What the people who actually worked with me said, with name, role and relation.",
				blog: "Lab notes: hypothesis, experiment and result. What I learned by trying.",
				contacto: "To talk about a role, a project or a specific question.",
				cv: "The résumé as a PDF, in case you need the usual format.",
			},
		},
		ui: {
			empresas: "companies",
			proyectos: "projects",
			notas: "notes",
			personas: "people",
			tiempos: "beats",
			cursos: "courses",
			remoto: "Remote",
			enRemoto: "remote",
			respuesta24h: "reply within 24 h",
			verMenos: "See less",
			verProyectos: (n: number) => `See the ${n} projects`,
			margenDelDia: "Margin of the day",
			formulaMargen: "$45,000 invoiced − $4,900 supplies = $40,100",
			verPanelCompleto: "See the full panel",
			altMargen:
				"Margin today: $40,100, 89%, with the line that explains it: $45,000 invoiced minus $4,900 in supplies.",
			altPanel:
				"Full NorteAR panel: today's till, monthly summary, sales, appointments, stock alerts and recent activity.",
			recomendacionesGlosa: "what the people who worked with me said",
			descartes: "This site · what I discarded",
		},
	},
};

export type Dict = (typeof DICT)["es"];

export const getDict = (lang: Language): Dict => DICT[lang];
