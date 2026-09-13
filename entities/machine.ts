import type { LocalizedText } from "./i18n";

export type MachineStatus = "en-construccion" | "en-prueba" | "terminado";

export type ObjectType = "producto" | "maquina" | "en-obra";

export interface Stage {
	parrafos: Record<string, string[]>;
	pendiente?: LocalizedText;
}

export interface Measurement {
	etiqueta: LocalizedText;
	valor: string | null;
}

export interface MechanismStage extends Stage {
	flujo?: Record<string, string[]>;
	codigo?: string | null;
	diagrama?: string;
}

export interface ResultStage extends Stage {
	medidas: Measurement[];
}

export interface MachineLink {
	etiqueta: LocalizedText;
	href: string;
	externo?: boolean;
}

export default interface Machine {
	slug: string;
	nombre: string;
	tipo: ObjectType;
	estado: MachineStatus;
	contexto: LocalizedText;
	periodo: LocalizedText | null;
	resumen: LocalizedText;
	stack: string[];
	enlaces: MachineLink[];
	peso: number;
	tiempos: {
		problema: Stage;
		decision: Stage;
		mecanismo: MechanismStage;
		tradeoff: Stage;
		resultado: ResultStage;
		despues: Stage;
	};
}
