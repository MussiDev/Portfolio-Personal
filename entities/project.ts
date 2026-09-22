import type { LocalizedText } from "./i18n";

export type ProjectStatus = "in-progress" | "in-testing" | "done";

export type ObjectType = "product" | "machine" | "work-in-progress";

export interface Stage {
	paragraphs: Record<string, string[]>;
	pending?: LocalizedText;
}

export interface Measurement {
	label: LocalizedText;
	value: string | null;
}

export interface MechanismStage extends Stage {
	flow?: Record<string, string[]>;
	code?: string | null;
	diagram?: string;
}

export interface ResultStage extends Stage {
	measurements: Measurement[];
}

export interface ProjectLink {
	label: LocalizedText;
	href: string;
	external?: boolean;
}

export default interface Project {
	slug: string;
	name: string;
	type: ObjectType;
	status: ProjectStatus;
	context: LocalizedText;
	period: LocalizedText | null;
	summary: LocalizedText;
	stack: string[];
	links: ProjectLink[];
	weight: number;
	stages: {
		problem: Stage;
		decision: Stage;
		mechanism: MechanismStage;
		tradeoff: Stage;
		result: ResultStage;
		after: Stage;
	};
}
