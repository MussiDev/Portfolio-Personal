import { ImageResponse } from "next/og";

import { isLanguage, LANGUAGES, type Language } from "../../../entities/i18n";
import { SITE_URL } from "../../../entities/site";
import { getDict } from "../../src/i18n/dict";

/**
 * The card that shows up whenever someone shares the site.
 *
 * It used to come from the previous concept (the workshop): IBM Plex
 * typefaces, a "DOC REG-01", and its own tagline duplicated in here. Now
 * it uses the same system as the site and NorteAR's card — Archivo,
 * Instrument Serif, JetBrains Mono — and the tagline comes from the
 * dictionary: the card says the same thing as the hero, and if the hero
 * changes, so does the card.
 */

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

export const alt = "Joaquín Mussi — Frontend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TISSUE = "#05070d";
const SIGNAL = "#e8edf5";
const MYELIN = "#9eacc1";
const SYNAPSE = "#7c98be";
const IMPULSE = "#ff6a3a";

const STACK = "Next.js · React · TypeScript · .NET";

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

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const l: Language = isLanguage(lang) ? lang : "es";
	const d = getDict(l);

	const title = "JOAQUÍN MUSSI";
	const subtitle = "FRONTEND ENGINEER";
	const pitch = d.hero.pitch;
	// The same label as the Career table, not one invented for this.
	const modeLabel = d.fields.location.toUpperCase();
	const mode = d.ui.remote;
	const domain = new URL(SITE_URL).host.toUpperCase();

	// Google only returns the glyphs from `text=`: every word that goes in
	// each font has to be in its list, or that letter falls back to the
	// system font (already happened with the "D" in ESTADO on NorteAR's
	// card).
	const [label, gloss, mono] = await Promise.all([
		loadFont(
			"Archivo:wdth,wght@112,800",
			title + subtitle + modeLabel + "STACK" + domain,
		),
		loadFont("Instrument+Serif:ital@1", pitch),
		loadFont("JetBrains+Mono:wght@500", STACK + mode),
	]);

	const field = (label: string, value: string) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<span style={{ fontFamily: "label", fontSize: 13, letterSpacing: 2, color: MYELIN }}>
				{label}
			</span>
			<span style={{ fontFamily: "mono", fontSize: 20, color: SYNAPSE }}>{value}</span>
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
						{subtitle}
					</span>
					<div
						style={{
							fontFamily: "label",
							fontSize: 96,
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
							fontSize: 44,
							lineHeight: 1.15,
							color: SIGNAL,
							maxWidth: 920,
							// Without this the Spanish sentence leaves "necesita." alone
							// on the second line.
							textWrap: "balance",
						}}
					>
						{pitch}
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
					{field("STACK", STACK)}
					{field(modeLabel, mode)}
					<div style={{ display: "flex", marginLeft: "auto", alignItems: "flex-end" }}>
						<span style={{ fontFamily: "label", fontSize: 18, letterSpacing: 2, color: MYELIN }}>
							{domain}
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
