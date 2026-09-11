/**
 * Una máquina: un proyecto contado en seis tiempos.
 *
 * El contrato es deliberadamente estricto en un punto: `pendiente` y los
 * `valor: null` son la forma de decir "esto todavía no está escrito". Una
 * máquina puede publicarse incompleta, pero nunca puede disimularlo.
 */

import type { Texto } from "./i18n";

export type EstadoMaquina = "en-construccion" | "en-prueba" | "terminado";

export type TipoObjeto = "producto" | "maquina" | "en-obra";

export interface Tiempo {
	/** Párrafos ya escritos, por idioma. Vacío mientras el tiempo no exista. */
	parrafos: Record<string, string[]>;
	/** Qué falta escribir. Se renderiza como hueco marcado, no se oculta. */
	pendiente?: Texto;
}

export interface Medida {
	etiqueta: Texto;
	/** null = todavía sin medir. Nunca se inventa un número. */
	valor: string | null;
}

export interface TiempoMecanismo extends Tiempo {
	/** Pasos del modelo de dominio, en orden y por idioma. */
	flujo?: Record<string, string[]>;
	/** Fragmento de código. null mientras no se eligió cuál mostrar. */
	codigo?: string | null;
	/**
	 * Un plano: diagrama Mermaid del mecanismo (arquitectura, modelo de
	 * datos, flujo real). El `flujo` de arriba es la cinta de pasos; esto
	 * es la vista de conjunto cuando el mecanismo tiene forma de sistema,
	 * no solo de secuencia.
	 */
	diagrama?: string;
}

export interface TiempoResultado extends Tiempo {
	medidas: Medida[];
}

export interface Enlace {
	etiqueta: Texto;
	href: string;
	externo?: boolean;
}

export default interface Machine {
	slug: string;
	nombre: string;
	tipo: TipoObjeto;
	estado: EstadoMaquina;
	/** Dónde se construyó: "Producto propio", "La Mutual de AMR", ... */
	contexto: Texto;
	periodo: Texto | null;
	/** Una frase. Es lo que se lee en la mesa. */
	resumen: Texto;
	stack: string[];
	enlaces: Enlace[];
	/** Orden en la mesa. 1 es el objeto principal. */
	peso: number;
	tiempos: {
		problema: Tiempo;
		decision: Tiempo;
		mecanismo: TiempoMecanismo;
		tradeoff: Tiempo;
		resultado: TiempoResultado;
		despues: Tiempo;
	};
}
