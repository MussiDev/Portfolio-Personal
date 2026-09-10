/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			boxShadow: {
				"3xl": "1px 3px 29px -8px rgba(242,79,15,1)",
			},
			fontFamily: {
				// Rótulos: títulos, etiquetas, encabezados de tabla.
				rotulo: ["var(--font-rotulo)", "Helvetica Neue", "Arial", "sans-serif"],
				// Notas: prosa larga.
				nota: ["var(--font-nota)", "Georgia", "Times New Roman", "serif"],
				// Piezas: datos, medidas, código.
				pieza: ["var(--font-pieza)", "SFMono-Regular", "Consolas", "monospace"],
				// Lápiz: anotaciones a mano. Nunca prosa, títulos ni datos.
				lapiz: ["var(--font-lapiz)", "Segoe Script", "Bradley Hand", "cursive"],
			},
			transitionTimingFunction: {
				// Arranca rápido y frena, como algo con masa.
				mecanico: "cubic-bezier(.2, .8, .2, 1)",
			},
		},
		colors: {
			// --- Taller: materiales ----------------------------------------
			mesa: "rgb(var(--mesa) / <alpha-value>)",
			hoja: "rgb(var(--hoja) / <alpha-value>)",
			"hoja-honda": "rgb(var(--hoja-honda) / <alpha-value>)",
			texto: "rgb(var(--texto) / <alpha-value>)",
			"texto-medio": "rgb(var(--texto-medio) / <alpha-value>)",
			linea: "rgb(var(--linea) / <alpha-value>)",
			marca: "rgb(var(--marca) / <alpha-value>)",

			// --- Legado --------------------------------------------------
			// Paleta del sitio anterior. Se mantiene mientras quedan secciones
			// sin migrar al taller; se elimina cuando la última salga.
			"slate-800": "#040508",
			"orange-700": "#F24F0F",
			"cyan-500": "#06b6d4",
			"red-500": "#ef4444",
			"blue-400": "#60a5fa",
			"blue-500": "#3b82f6",
			"yellow-500": "#eab308",
			"purple-500": "#a855f7",
			"purple-800": "#6b21a8",
			"sky-900": "#0c4a6e",
			"pink-500": "#ec4899",

			transparent: "transparent",
			current: "currentColor",
			white: "#fff",
			black: "#000",
		},
	},
	plugins: [],
};
