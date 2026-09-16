"use client";

/**
 * Sustituto 2D del cerebro 3D para mobile. En vez de pagar three.js +
 * EffectComposer + el .bin de 466 KB para una decoración al 40% de
 * opacidad (que es lo que hacía antes de esto), mobile no descarga nada
 * de eso: la navegación real ya vive en el <nav> de la home (los mismos
 * seis destinos, como lista), y esto es solo la identidad visual —
 * mismos tokens de color, mismas animaciones ya definidas en
 * tailwind.config.js (disparo, respirar), nada nuevo que probar.
 *
 * Los nodos no son clickeables a propósito: son decoración, igual que el
 * cerebro en desktop es decoración detrás de la navegación real por
 * teclas/hover. Por eso todo el SVG es aria-hidden.
 *
 * Las dos líneas más marcadas son las únicas conexiones reales del sitio
 * (ver Section.related en page.tsx): Trayectoria↔NorteAR y
 * Trayectoria↔Recomendaciones. El resto de las líneas son ambiente, al
 * mismo nivel de honestidad que los 120 sparks espontáneos del cerebro
 * 3D — no afirman una relación que no existe.
 */

type Node = { x: number; y: number; pulse?: boolean };

// Posiciones relativas (viewBox 0 0 320 200), una por sección en el mismo
// orden que `sections` en page.tsx.
const NODES: Node[] = [
	{ x: 70, y: 100, pulse: true }, // 0 Trayectoria
	{ x: 150, y: 55 }, // 1 NorteAR
	{ x: 150, y: 145 }, // 2 Recomendaciones
	{ x: 250, y: 70, pulse: true }, // 3 Blog
	{ x: 230, y: 150 }, // 4 Contacto
	{ x: 40, y: 40 }, // 5 CV
];

// Conexiones reales primero (más marcadas), después un par de líneas
// ambientales cortas para que no se vea como un diagrama de red vacío.
const REAL_LINKS: [number, number][] = [
	[0, 1],
	[0, 2],
];
const AMBIENT_LINKS: [number, number][] = [
	[3, 4],
	[4, 5],
];

const NervousSystemMobile = () => (
	<svg
		aria-hidden='true'
		viewBox='0 0 320 200'
		preserveAspectRatio='xMidYMid meet'
		className='h-full w-full text-sinapsis'
	>
		{AMBIENT_LINKS.map(([a, b]) => (
			<line
				key={`amb-${a}-${b}`}
				x1={NODES[a].x}
				y1={NODES[a].y}
				x2={NODES[b].x}
				y2={NODES[b].y}
				stroke='currentColor'
				strokeOpacity={0.18}
				strokeWidth={1}
			/>
		))}
		{REAL_LINKS.map(([a, b]) => (
			<line
				key={`real-${a}-${b}`}
				x1={NODES[a].x}
				y1={NODES[a].y}
				x2={NODES[b].x}
				y2={NODES[b].y}
				stroke='rgb(255 106 58)'
				strokeOpacity={0.5}
				strokeWidth={1.2}
				strokeDasharray='3 4'
				strokeDashoffset={70}
				className='animate-conduccion'
			/>
		))}
		{NODES.map((n, i) => (
			<circle
				key={i}
				cx={n.x}
				cy={n.y}
				r={i === 0 ? 4 : 3}
				fill={i === 0 ? "rgb(255 106 58)" : "currentColor"}
				className={n.pulse ? "animate-respirar" : undefined}
			/>
		))}
	</svg>
);

export default NervousSystemMobile;
