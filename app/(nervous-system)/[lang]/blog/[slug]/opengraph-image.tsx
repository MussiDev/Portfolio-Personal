import { ImageResponse } from "next/og";

import { client } from "../../../../../sanity/lib/client";
import { postBySlugQuery } from "../../../../../sanity/lib/queries";
import { cleanTitle } from "../../../../src/components/Blog/title";
import { coverFromTissue } from "../../../../src/common/postCover";
import { getTissue2D } from "../../../../src/common/tissue2dServer";

/**
 * The card shown when someone shares a post.
 *
 * It used to be the stock illustration the post carried from Sanity: a
 * rocket, some blue nodes, a markdown screenshot. Four posts, four
 * different image banks, and none of them resembling the site that
 * publishes them.
 *
 * Now it's the same tissue crop the post shows right at the top
 * (postCover.ts), with the same skeleton as the site's other two cards:
 * grid, corner marks, bottom strip.
 */

// Without this the card stays dynamic and only gets built when a scraper
// requests it — the same reason projects/[slug]'s prerenders.
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

const TISSUE = "#05070d";
const SIGNAL = "#e8edf5";
const MYELIN = "#9eacc1";
const SYNAPSE = "#7c98be";
const IMPULSE = "#ff6a3a";

/** The tissue band's height, above the title. */
const BAND = 250;

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
		// The CMS being down can't take the whole build down over one card.
		post = null;
	}

	const title = cleanTitle(post?.title ?? "").toUpperCase();
	const tags = post?.tags ?? [];
	// A long title at 64px fits in three lines; more than that eats into the
	// bottom strip, so past a certain length the body size drops.
	const bodySize = title.length > 70 ? 46 : 64;
	const noteLabel = "NOTA";
	const author = "JOAQUÍN MUSSI";
	const labels = `${noteLabel}${author}${tags.join("")}`;

	const brain = await getTissue2D();
	const tissue = brain
		? coverFromTissue(brain, slug, {
				aspect: size.width / BAND,
				zoom: 0.2,
				markCount: tags.length,
			})
		: null;

	const [label, mono] = await Promise.all([
		loadFont("Archivo:wdth,wght@112,800", title + labels),
		loadFont("JetBrains+Mono:wght@500", labels),
	]);

	const x = (v: number) => v * size.width;
	const y = (v: number) => v * BAND;

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
					position: "relative",
				}}
			>
				{/* The tissue band: the same crop the post shows right at the
				top, drawn in SVG because ImageResponse doesn't load external
				images and none is needed here. */}
				<div style={{ display: "flex", height: BAND, width: "100%" }}>
					{tissue && (
						<svg width={size.width} height={BAND} viewBox={`0 0 ${size.width} ${BAND}`}>
							<g stroke={SYNAPSE} strokeWidth={1.1} opacity={0.38}>
								{Array.from({ length: tissue.edges.length / 4 }, (_, i) => (
									<line
										key={i}
										x1={x(tissue.edges[i * 4])}
										y1={y(tissue.edges[i * 4 + 1])}
										x2={x(tissue.edges[i * 4 + 2])}
										y2={y(tissue.edges[i * 4 + 3])}
									/>
								))}
							</g>
							<g fill={SYNAPSE} opacity={0.85}>
								{Array.from({ length: tissue.points.length / 2 }, (_, i) => (
									<circle
										key={i}
										cx={x(tissue.points[i * 2])}
										cy={y(tissue.points[i * 2 + 1])}
										r={2.6}
									/>
								))}
							</g>
							<g fill={IMPULSE}>
								{Array.from({ length: tissue.marks.length / 2 }, (_, i) => (
									<circle
										key={i}
										cx={x(tissue.marks[i * 2])}
										cy={y(tissue.marks[i * 2 + 1])}
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
					<span style={{ fontFamily: "label", fontSize: 15, letterSpacing: 3, color: IMPULSE }}>
						{noteLabel}
					</span>
					<div
						style={{
							fontFamily: "label",
							fontSize: bodySize,
							fontWeight: 800,
							color: SIGNAL,
							lineHeight: 1,
						}}
					>
						{title}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						borderTop: `2px solid ${SYNAPSE}`,
						margin: "0 72px 40px",
						paddingTop: 20,
						gap: 24,
					}}
				>
					<span style={{ fontFamily: "mono", fontSize: 18, color: SYNAPSE }}>
						{tags.slice(0, 4).join(" · ")}
					</span>
					<span
						style={{
							fontFamily: "label",
							fontSize: 18,
							letterSpacing: 2,
							color: MYELIN,
							marginLeft: "auto",
						}}
					>
						{author}
					</span>
				</div>

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
			</div>
		),
		{
			...size,
			fonts: [
				label && { name: "label", data: label, weight: 800 as const, style: "normal" as const },
				mono && { name: "mono", data: mono, weight: 500 as const, style: "normal" as const },
			].filter((f): f is Exclude<typeof f, false | null> => Boolean(f)),
		},
	);
}
