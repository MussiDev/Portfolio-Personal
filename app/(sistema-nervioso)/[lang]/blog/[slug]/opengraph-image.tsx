import { ImageResponse } from "next/og";

import { client } from "../../../../../sanity/lib/client";
import { postBySlugQuery } from "../../../../../sanity/lib/queries";
import { limpiarTitulo } from "../../../../src/components/Blog/title";
import { coverFromTissue } from "../../../../src/common/postCover";
import { getTissue2D } from "../../../../src/common/tissue2dServer";

/**
 * La tarjeta que se ve cuando alguien comparte una nota.
 *
 * Antes era la ilustración de stock que traía el post de Sanity: un cohete,
 * unos nodos azules, una captura de markdown. Cuatro notas, cuatro bancos
 * de imágenes distintos, y ninguna parecida al sitio que las publica.
 *
 * Ahora es el mismo recorte de tejido que la nota muestra arriba de todo
 * (postCover.ts), con el mismo esqueleto que las otras dos tarjetas del
 * sitio: grilla, marcas de esquina, franja inferior.
 */

// Sin esto la tarjeta queda dinámica y se arma recién cuando un scraper
// la pide — el mismo motivo por el que la de proyectos/[slug] prerenderiza.
export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
	try {
		return await client.fetch(`*[_type=="post"]{ "slug": slug.current }`);
	} catch {
		return [];
	}
};

export const alt = "Joaquín Mussi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEJIDO = "#05070d";
const SENAL = "#e8edf5";
const MIELINA = "#9eacc1";
const SINAPSIS = "#7c98be";
const IMPULSO = "#ff6a3a";

/** El alto de la banda de tejido, arriba del título. */
const BANDA = 250;

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

type Post = { title: string; tags?: string[] };

export default async function Image({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}) {
	const { slug } = await params;

	let post: Post | null = null;
	try {
		post = await client.fetch<Post>(postBySlugQuery, { slug });
	} catch {
		// El CMS caído no puede tumbar el build entero por una tarjeta.
		post = null;
	}

	const titulo = limpiarTitulo(post?.title ?? "").toUpperCase();
	const tags = post?.tags ?? [];
	// Un título largo a 64px entra en tres renglones; más que eso se come la
	// franja de abajo, así que a partir de cierto largo el cuerpo baja.
	const cuerpo = titulo.length > 70 ? 46 : 64;
	const nota = "NOTA";
	const autor = "JOAQUÍN MUSSI";
	const etiquetas = `${nota}${autor}${tags.join("")}`;

	const brain = await getTissue2D();
	const tejido = brain
		? coverFromTissue(brain, slug, {
				aspect: size.width / BANDA,
				zoom: 0.2,
				markCount: tags.length,
			})
		: null;

	const [rotulo, pieza] = await Promise.all([
		cargarFuente("Archivo:wdth,wght@112,800", titulo + etiquetas),
		cargarFuente("JetBrains+Mono:wght@500", etiquetas),
	]);

	const x = (v: number) => v * size.width;
	const y = (v: number) => v * BANDA;

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
					position: "relative",
				}}
			>
				{/* La banda de tejido: el mismo recorte que la nota muestra
				arriba de todo, dibujado en SVG porque ImageResponse no carga
				imágenes externas y acá no hace falta ninguna. */}
				<div style={{ display: "flex", height: BANDA, width: "100%" }}>
					{tejido && (
						<svg width={size.width} height={BANDA} viewBox={`0 0 ${size.width} ${BANDA}`}>
							<g stroke={SINAPSIS} strokeWidth={1.1} opacity={0.38}>
								{Array.from({ length: tejido.edges.length / 4 }, (_, i) => (
									<line
										key={i}
										x1={x(tejido.edges[i * 4])}
										y1={y(tejido.edges[i * 4 + 1])}
										x2={x(tejido.edges[i * 4 + 2])}
										y2={y(tejido.edges[i * 4 + 3])}
									/>
								))}
							</g>
							<g fill={SINAPSIS} opacity={0.85}>
								{Array.from({ length: tejido.points.length / 2 }, (_, i) => (
									<circle
										key={i}
										cx={x(tejido.points[i * 2])}
										cy={y(tejido.points[i * 2 + 1])}
										r={2.6}
									/>
								))}
							</g>
							<g fill={IMPULSO}>
								{Array.from({ length: tejido.marks.length / 2 }, (_, i) => (
									<circle
										key={i}
										cx={x(tejido.marks[i * 2])}
										cy={y(tejido.marks[i * 2 + 1])}
										r={7}
									/>
								))}
							</g>
						</svg>
					)}
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						justifyContent: "center",
						gap: 22,
						padding: "0 72px",
					}}
				>
					<span style={{ fontFamily: "rotulo", fontSize: 15, letterSpacing: 3, color: IMPULSO }}>
						{nota}
					</span>
					<div
						style={{
							fontFamily: "rotulo",
							fontSize: cuerpo,
							fontWeight: 800,
							color: SENAL,
							lineHeight: 1,
						}}
					>
						{titulo}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						borderTop: `2px solid ${SINAPSIS}`,
						margin: "0 72px 40px",
						paddingTop: 20,
						gap: 24,
					}}
				>
					<span style={{ fontFamily: "pieza", fontSize: 18, color: SINAPSIS }}>
						{tags.slice(0, 4).join(" · ")}
					</span>
					<span
						style={{
							fontFamily: "rotulo",
							fontSize: 18,
							letterSpacing: 2,
							color: MIELINA,
							marginLeft: "auto",
						}}
					>
						{autor}
					</span>
				</div>

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
			</div>
		),
		{
			...size,
			fonts: [
				rotulo && { name: "rotulo", data: rotulo, weight: 800 as const, style: "normal" as const },
				pieza && { name: "pieza", data: pieza, weight: 500 as const, style: "normal" as const },
			].filter((f): f is Exclude<typeof f, false | null> => Boolean(f)),
		},
	);
}
