import { ImageResponse } from "next/og";

import { isLanguage, t, type Language } from "../../../../../entities/i18n";
import { STATUS_LABEL, getProject, getProjects } from "../../../../src/common/projects";

/**
 * La tarjeta que se ve cuando alguien comparte el caso.
 *
 * Sin esto, la página heredaba la tarjeta genérica de la home — o, peor,
 * ninguna: declarar `openGraph` en la página reemplaza el del layout entero
 * y se perdía la imagen. Es la URL del sitio que más sentido tiene
 * compartir, así que la tarjeta dice de qué trata: el nombre del producto y
 * el problema que resuelve.
 *
 * Mismo esqueleto que la tarjeta de la home (grilla, marcas de esquina,
 * franja inferior), pero con las tipografías del sistema actual.
 */

export const generateStaticParams = () =>
	getProjects().map((project) => ({ slug: project.slug }));

export const alt = "NorteAR — Joaquín Mussi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEJIDO = "#05070d";
const SENAL = "#e8edf5";
const MIELINA = "#9eacc1";
const SINAPSIS = "#7c98be";
const IMPULSO = "#ff6a3a";

const cargarFuente = async (query: string, texto: string): Promise<ArrayBuffer | null> => {
	try {
		const css = await fetch(
			`https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(texto)}`,
		).then((r) => r.text());
		const url = css.match(/src: url\(([^)]+)\)/)?.[1];
		if (!url) return null;
		return await fetch(url).then((r) => r.arrayBuffer());
	} catch {
		// Sin red en build la tarjeta sale igual, con la fuente por defecto.
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

	const titulo = (project?.nombre ?? "Joaquín Mussi").toUpperCase();
	const resumen = project ? t(project.resumen, l) : "";
	const estado = project ? STATUS_LABEL[project.estado][l].toUpperCase() : "";
	const stack = project?.stack.join(" · ") ?? "";
	const caso = l === "es" ? "CASO EN SEIS TIEMPOS" : "CASE IN SIX BEATS";
	const autor = "JOAQUÍN MUSSI";
	const rotuloEstado = l === "es" ? "ESTADO" : "STATUS";
	// Google devuelve solo los glifos de `text=`: toda palabra que vaya en la
	// fuente de rótulo tiene que estar acá, o esa letra cae a la de sistema.
	const etiquetas = `${caso}${estado}${rotuloEstado}STACK${autor}`;

	const [rotulo, glosa, pieza] = await Promise.all([
		cargarFuente("Archivo:wdth,wght@112,800", titulo + etiquetas),
		cargarFuente("Instrument+Serif:ital@1", resumen),
		cargarFuente("JetBrains+Mono:wght@500", stack + estado),
	]);

	const campo = (etiqueta: string, valor: string, color = SINAPSIS) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<span style={{ fontFamily: "rotulo", fontSize: 13, letterSpacing: 2, color: MIELINA }}>
				{etiqueta}
			</span>
			<span style={{ fontFamily: "pieza", fontSize: 20, color }}>{valor}</span>
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
					background: TEJIDO,
					backgroundImage:
						`repeating-linear-gradient(to right, ${SINAPSIS}1f 0 1px, transparent 1px 32px),` +
						`repeating-linear-gradient(to bottom, ${SINAPSIS}1f 0 1px, transparent 1px 32px)`,
					padding: "72px",
					position: "relative",
				}}
			>
				{(["top left", "top right", "bottom left", "bottom right"] as const).map((esquina) => {
					const [v, h] = esquina.split(" ") as ["top" | "bottom", "left" | "right"];
					const trazo = `2px solid ${SINAPSIS}`;
					return (
						<div
							key={esquina}
							style={{
								position: "absolute",
								width: 22,
								height: 22,
								opacity: 0.5,
								[v]: 32,
								[h]: 32,
								...(v === "top" ? { borderTop: trazo } : { borderBottom: trazo }),
								...(h === "left" ? { borderLeft: trazo } : { borderRight: trazo }),
							}}
						/>
					);
				})}

				<div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 28 }}>
					<span style={{ fontFamily: "rotulo", fontSize: 15, letterSpacing: 3, color: IMPULSO }}>
						{caso}
					</span>
					<div
						style={{
							fontFamily: "rotulo",
							fontSize: 112,
							fontWeight: 800,
							color: SENAL,
							lineHeight: 0.9,
						}}
					>
						{titulo}
					</div>
					<div
						style={{
							fontFamily: "glosa",
							fontStyle: "italic",
							fontSize: 42,
							lineHeight: 1.15,
							color: SENAL,
							maxWidth: 900,
						}}
					>
						{resumen}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						borderTop: `2px solid ${SINAPSIS}`,
						paddingTop: 24,
						gap: 56,
					}}
				>
					{campo(rotuloEstado, estado, IMPULSO)}
					{campo("STACK", stack)}
					<div style={{ display: "flex", marginLeft: "auto", alignItems: "flex-end" }}>
						<span style={{ fontFamily: "rotulo", fontSize: 18, letterSpacing: 2, color: MIELINA }}>
							{autor}
						</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				rotulo && { name: "rotulo", data: rotulo, weight: 800 as const, style: "normal" as const },
				glosa && { name: "glosa", data: glosa, weight: 400 as const, style: "italic" as const },
				pieza && { name: "pieza", data: pieza, weight: 500 as const, style: "normal" as const },
			].filter((f): f is Exclude<typeof f, false | null> => Boolean(f)),
		},
	);
}
