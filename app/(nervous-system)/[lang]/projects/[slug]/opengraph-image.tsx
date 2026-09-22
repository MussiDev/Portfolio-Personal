import { ImageResponse } from "next/og";

import { isLanguage, t, type Language } from "../../../../../entities/i18n";
import { STATUS_LABEL, getProject, getProjects } from "../../../../src/common/projects";

/**
 * The card shown when someone shares the case.
 *
 * Without this, the page inherited the home's generic card — or, worse,
 * none: declaring `openGraph` on the page replaces the whole layout's and
 * the image was lost. This is the site's URL that makes the most sense to
 * share, so the card says what it's about: the product's name and the
 * problem it solves.
 *
 * Same skeleton as the home's card (grid, corner marks, bottom strip), but
 * with the current system's typefaces.
 */

export const generateStaticParams = () =>
	getProjects().map((project) => ({ slug: project.slug }));

export const alt = "NorteAR — Joaquín Mussi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TISSUE = "#05070d";
const SIGNAL = "#e8edf5";
const MYELIN = "#9eacc1";
const SYNAPSE = "#7c98be";
const IMPULSE = "#ff6a3a";

const loadFont = async (query: string, text: string): Promise<ArrayBuffer | null> => {
	try {
		const css = await fetch(
			`https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(text)}`,
		).then((r) => r.text());
		const url = css.match(/src: url\(([^)]+)\)/)?.[1];
		if (!url) return null;
		return await fetch(url).then((r) => r.arrayBuffer());
	} catch {
		// With no network at build time the card still comes out, with the
		// default font.
		return null;
	}
};

export default async function Image({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { lang, slug } = await params;
	const l: Language = isLanguage(lang) ? lang : "es";
	const project = getProject(slug);

	const title = (project?.name ?? "Joaquín Mussi").toUpperCase();
	const summary = project ? t(project.summary, l) : "";
	const status = project ? STATUS_LABEL[project.status][l].toUpperCase() : "";
	const stack = project?.stack.join(" · ") ?? "";
	const caseLabel = l === "es" ? "CASO EN SEIS TIEMPOS" : "CASE IN SIX BEATS";
	const author = "JOAQUÍN MUSSI";
	const statusLabel = l === "es" ? "ESTADO" : "STATUS";
	// Google only returns the glyphs from `text=`: every word going into the
	// label font has to be here, or that letter falls back to the system font.
	const labels = `${caseLabel}${status}${statusLabel}STACK${author}`;

	const [label, gloss, mono] = await Promise.all([
		loadFont("Archivo:wdth,wght@112,800", title + labels),
		loadFont("Instrument+Serif:ital@1", summary),
		loadFont("JetBrains+Mono:wght@500", stack + status),
	]);

	const field = (fieldLabel: string, value: string, color = SYNAPSE) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<span style={{ fontFamily: "label", fontSize: 13, letterSpacing: 2, color: MYELIN }}>
				{fieldLabel}
			</span>
			<span style={{ fontFamily: "mono", fontSize: 20, color }}>{value}</span>
		</div>
	);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					background: TISSUE,
					backgroundImage:
						`repeating-linear-gradient(to right, ${SYNAPSE}1f 0 1px, transparent 1px 32px),` +
						`repeating-linear-gradient(to bottom, ${SYNAPSE}1f 0 1px, transparent 1px 32px)`,
					padding: "72px",
					position: "relative",
				}}
			>
				{(["top left", "top right", "bottom left", "bottom right"] as const).map((corner) => {
					const [v, h] = corner.split(" ") as ["top" | "bottom", "left" | "right"];
					const stroke = `2px solid ${SYNAPSE}`;
					return (
						<div
							key={corner}
							style={{
								position: "absolute",
								width: 22,
								height: 22,
								opacity: 0.5,
								[v]: 32,
								[h]: 32,
								...(v === "top" ? { borderTop: stroke } : { borderBottom: stroke }),
								...(h === "left" ? { borderLeft: stroke } : { borderRight: stroke }),
							}}
						/>
					);
				})}

				<div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 28 }}>
					<span style={{ fontFamily: "label", fontSize: 15, letterSpacing: 3, color: IMPULSE }}>
						{caseLabel}
					</span>
					<div
						style={{
							fontFamily: "label",
							fontSize: 112,
							fontWeight: 800,
							color: SIGNAL,
							lineHeight: 0.9,
						}}
					>
						{title}
					</div>
					<div
						style={{
							fontFamily: "gloss",
							fontStyle: "italic",
							fontSize: 42,
							lineHeight: 1.15,
							color: SIGNAL,
							maxWidth: 900,
						}}
					>
						{summary}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						borderTop: `2px solid ${SYNAPSE}`,
						paddingTop: 24,
						gap: 56,
					}}
				>
					{field(statusLabel, status, IMPULSE)}
					{field("STACK", stack)}
					<div style={{ display: "flex", marginLeft: "auto", alignItems: "flex-end" }}>
						<span style={{ fontFamily: "label", fontSize: 18, letterSpacing: 2, color: MYELIN }}>
							{author}
						</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				label && { name: "label", data: label, weight: 800 as const, style: "normal" as const },
				gloss && { name: "gloss", data: gloss, weight: 400 as const, style: "italic" as const },
				mono && { name: "mono", data: mono, weight: 500 as const, style: "normal" as const },
			].filter((f): f is Exclude<typeof f, false | null> => Boolean(f)),
		},
	);
}
