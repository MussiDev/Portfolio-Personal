import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Joaquín Mussi - Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Paleta del taller (styles/globals.css) en hex — Satori no resuelve
// custom properties CSS, así que estos valores se repiten a mano acá.
const HOJA = "#f7f6f1";
const TEXTO = "#1f2124";
const TEXTO_MEDIO = "#6a6c6e";
const LINEA = "#2f5c7e";
const MARCA = "#9a3a2a";

/** Trae el .ttf real de Google Fonts: Satori no puede usar next/font. */
const cargarFuente = async (query: string, texto: string) => {
	const css = await fetch(
		`https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(texto)}`,
	).then((r) => r.text());
	const url = css.match(/src: url\(([^)]+)\)/)?.[1];
	if (!url) throw new Error(`No se encontró la fuente para "${query}"`);
	return fetch(url).then((r) => r.arrayBuffer());
};

export default async function Image() {
	const TITULO = "JOAQUÍN MUSSI";
	const TAGLINE = "Construyo y modernizo productos web";
	const CAMPOS = "ROL  Software Engineer   STACK  Next.js · React · TypeScript · .NET";

	const [rotulo, nota, pieza] = await Promise.all([
		cargarFuente("IBM+Plex+Sans+Condensed:wght@700", TITULO + CAMPOS),
		cargarFuente("IBM+Plex+Serif:ital,wght@1,400", TAGLINE),
		cargarFuente("IBM+Plex+Mono:wght@500", CAMPOS + "01"),
	]);

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					background: HOJA,
					backgroundImage:
						`repeating-linear-gradient(to right, ${LINEA}12 0 1px, transparent 1px 32px),` +
						`repeating-linear-gradient(to bottom, ${LINEA}12 0 1px, transparent 1px 32px)`,
					padding: "72px",
					position: "relative",
				}}
			>
				{/* Marcas de registro, como en las hojas del sitio. */}
				{[
					{ top: 32, left: 32, border: "top left" as const },
					{ top: 32, right: 32, border: "top right" as const },
					{ bottom: 32, left: 32, border: "bottom left" as const },
					{ bottom: 32, right: 32, border: "bottom right" as const },
				].map(({ border, ...pos }, i) => {
					// Satori no tolera `undefined` en un valor de estilo como
					// React sí — cada esquina arma sus propios dos bordes, sin
					// condicionales que dejen una propiedad sin resolver.
					const [ladoV, ladoH] = border.split(" ") as ["top" | "bottom", "left" | "right"];
					const trazo = `2px solid ${LINEA}`;
					return (
						<div
							key={i}
							style={{
								position: "absolute",
								width: 22,
								height: 22,
								opacity: 0.55,
								...pos,
								...(ladoV === "top" ? { borderTop: trazo } : { borderBottom: trazo }),
								...(ladoH === "left" ? { borderLeft: trazo } : { borderRight: trazo }),
							}}
						/>
					);
				})}

				<div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 28 }}>
					<div
						style={{
							fontFamily: "rotulo",
							fontSize: 96,
							fontWeight: 700,
							letterSpacing: 4,
							color: TEXTO,
							lineHeight: 0.95,
						}}
					>
						{TITULO}
					</div>
					<div
						style={{
							fontFamily: "nota",
							fontStyle: "italic",
							fontSize: 34,
							color: TEXTO_MEDIO,
						}}
					>
						{TAGLINE}
					</div>
				</div>

				{/* El cajetín: mismo aparato que cierra cada lámina del sitio. */}
				<div
					style={{
						display: "flex",
						borderTop: `2px solid ${LINEA}`,
						paddingTop: 24,
						gap: 56,
						fontFamily: "pieza",
					}}
				>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<span style={{ fontFamily: "rotulo", fontSize: 13, letterSpacing: 2, color: TEXTO_MEDIO }}>
							ROL
						</span>
						<span style={{ fontSize: 20, color: LINEA }}>Software Engineer</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						<span style={{ fontFamily: "rotulo", fontSize: 13, letterSpacing: 2, color: TEXTO_MEDIO }}>
							STACK
						</span>
						<span style={{ fontSize: 20, color: LINEA }}>Next.js · React · TypeScript · .NET</span>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: "auto" }}>
						<span style={{ fontFamily: "rotulo", fontSize: 13, letterSpacing: 2, color: TEXTO_MEDIO }}>
							DOC
						</span>
						<span style={{ fontSize: 20, color: MARCA }}>REG-01</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{ name: "rotulo", data: rotulo, weight: 700, style: "normal" },
				{ name: "nota", data: nota, weight: 400, style: "italic" },
				{ name: "pieza", data: pieza, weight: 500, style: "normal" },
			],
		},
	);
}
