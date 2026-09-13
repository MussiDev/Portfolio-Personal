import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Joaquín Mussi - Frontend Engineer";
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
		return null;
	}
};

export default async function Image() {
	const TITLE = "JOAQUÍN MUSSI";
	const TAGLINE = "Arquitectura frontend y performance";
	const FIELDS = "ROL  Frontend Engineer   STACK  Next.js · React · TypeScript · APIs .NET";

	const [label, prose, mono] = await Promise.all([
		loadFont("IBM+Plex+Sans+Condensed:wght@700", TITLE + FIELDS),
		loadFont("IBM+Plex+Serif:ital,wght@1,400", TAGLINE),
		loadFont("IBM+Plex+Mono:wght@500", FIELDS + "01"),
	]);

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
				{[
					{ top: 32, left: 32, border: "top left" as const },
					{ top: 32, right: 32, border: "top right" as const },
					{ bottom: 32, left: 32, border: "bottom left" as const },
					{ bottom: 32, right: 32, border: "bottom right" as const },
				].map(({ border, ...pos }, i) => {
					const [vSide, hSide] = border.split(" ") as ["top" | "bottom", "left" | "right"];
					const stroke = `2px solid ${SYNAPSE}`;
					return (
						<div
							key={i}
							style={{
								position: "absolute",
								width: 22,
								height: 22,
								opacity: 0.5,
								...pos,
								...(vSide === "top" ? { borderTop: stroke } : { borderBottom: stroke }),
								...(hSide === "left" ? { borderLeft: stroke } : { borderRight: stroke }),
							}}
						/>
					);
				})}

				<div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 28 }}>
					<div
						style={{
							fontFamily: "label",
							fontSize: 96,
							fontWeight: 700,
							letterSpacing: 4,
							color: SIGNAL,
							lineHeight: 0.95,
						}}
					>
						{TITLE}
					</div>
					<div
						style={{
							fontFamily: "prose",
							fontStyle: "italic",
							fontSize: 34,
							color: MYELIN,
						}}
					>
						{TAGLINE}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						borderTop: `2px solid ${SYNAPSE}`,
						paddingTop: 24,
						gap: 56,
						fontFamily: "mono",
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<span style={{ fontFamily: "label", fontSize: 13, letterSpacing: 2, color: MYELIN }}>
							ROL
						</span>
						<span style={{ fontSize: 20, color: SYNAPSE }}>Frontend Engineer</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<span style={{ fontFamily: "label", fontSize: 13, letterSpacing: 2, color: MYELIN }}>
							STACK
						</span>
						<span style={{ fontSize: 20, color: SYNAPSE }}>Next.js · React · TypeScript · APIs .NET</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: "auto" }}>
						<span style={{ fontFamily: "label", fontSize: 13, letterSpacing: 2, color: MYELIN }}>
							DOC
						</span>
						<span style={{ fontSize: 20, color: IMPULSE }}>REG-01</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				label && { name: "label", data: label, weight: 700 as const, style: "normal" as const },
				prose && { name: "prose", data: prose, weight: 400 as const, style: "italic" as const },
				mono && { name: "mono", data: mono, weight: 500 as const, style: "normal" as const },
			].filter((f): f is Exclude<typeof f, false | null> => Boolean(f)),
		},
	);
}
