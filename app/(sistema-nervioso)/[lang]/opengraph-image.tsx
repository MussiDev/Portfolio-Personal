import { ImageResponse } from "next/og";

import { isLanguage, LANGUAGES, type Language } from "../../../entities/i18n";
import { SITE_URL } from "../../../entities/site";
import { getDict } from "../../src/i18n/dict";

/**
 * La tarjeta que aparece cada vez que alguien comparte el sitio.
 *
 * Venía del concepto anterior (el taller): tipografías IBM Plex, un
 * "DOC REG-01" y una bajada propia duplicada acá adentro. Ahora usa el
 * mismo sistema que el sitio y que la tarjeta de NorteAR — Archivo,
 * Instrument Serif, JetBrains Mono — y la bajada sale del diccionario: la
 * tarjeta dice lo mismo que el hero, y si el hero cambia, la tarjeta
 * también.
 */

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

export const alt = "Joaquín Mussi — Frontend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEJIDO = "#05070d";
const SENAL = "#e8edf5";
const MIELINA = "#9eacc1";
const SINAPSIS = "#7c98be";
const IMPULSO = "#ff6a3a";

const STACK = "Next.js · React · TypeScript · .NET";

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

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	const l: Language = isLanguage(lang) ? lang : "es";
	const d = getDict(l);

	const titulo = "JOAQUÍN MUSSI";
	const bajante = "FRONTEND ENGINEER";
	const propuesta = d.hero.propuesta;
	// La misma etiqueta que la tabla de Contacto, no una inventada para acá.
	const rotuloModalidad = d.campos.lugar.toUpperCase();
	const modalidad = d.ui.remoto;
	const dominio = new URL(SITE_URL).host.toUpperCase();

	// Google devuelve solo los glifos de `text=`: toda palabra que vaya en
	// cada fuente tiene que estar en su lista, o esa letra cae a la de
	// sistema (ya pasó con la "D" de ESTADO en la tarjeta de NorteAR).
	const [rotulo, glosa, pieza] = await Promise.all([
		cargarFuente(
			"Archivo:wdth,wght@112,800",
			titulo + bajante + rotuloModalidad + "STACK" + dominio,
		),
		cargarFuente("Instrument+Serif:ital@1", propuesta),
		cargarFuente("JetBrains+Mono:wght@500", STACK + modalidad),
	]);

	const campo = (etiqueta: string, valor: string) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<span style={{ fontFamily: "rotulo", fontSize: 13, letterSpacing: 2, color: MIELINA }}>
				{etiqueta}
			</span>
			<span style={{ fontFamily: "pieza", fontSize: 20, color: SINAPSIS }}>{valor}</span>
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
						{bajante}
					</span>
					<div
						style={{
							fontFamily: "rotulo",
							fontSize: 96,
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
							fontSize: 44,
							lineHeight: 1.15,
							color: SENAL,
							maxWidth: 920,
							// Sin esto la frase en español deja "necesita." sola en
							// la segunda línea.
							textWrap: "balance",
						}}
					>
						{propuesta}
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
					{campo("STACK", STACK)}
					{campo(rotuloModalidad, modalidad)}
					<div style={{ display: "flex", marginLeft: "auto", alignItems: "flex-end" }}>
						<span style={{ fontFamily: "rotulo", fontSize: 18, letterSpacing: 2, color: MIELINA }}>
							{dominio}
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
