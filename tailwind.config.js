/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			screens: {
				// Same query as DESKTOP_QUERY (app/src/common/desktopQuery.ts):
				// wide AND hover-capable. Only for the 3D-index UI; layout
				// widths keep using md/lg.
				desk: { raw: "(min-width: 768px) and (hover: hover) and (pointer: fine)" },
			},
			fontFamily: {
				label: ["var(--font-label)", "Helvetica Neue", "Arial", "sans-serif"],
				gloss: ["var(--font-gloss)", "Georgia", "Times New Roman", "serif"],
				mono: ["var(--font-mono)", "SFMono-Regular", "Consolas", "monospace"],
			},
			transitionTimingFunction: {
				impulse: "cubic-bezier(.16, 1, .3, 1)",
			},
			keyframes: {
				fire: {
					"0%, 100%": { opacity: ".25", transform: "scale(1)" },
					"8%": { opacity: "1", transform: "scale(1.9)" },
					"30%": { opacity: ".35", transform: "scale(1)" },
				},
				conduction: {
					to: { strokeDashoffset: "0" },
				},
				breathe: {
					"0%, 100%": { opacity: ".45" },
					"50%": { opacity: "1" },
				},
			},
			animation: {
				fire: "fire 4s cubic-bezier(.16,1,.3,1) infinite",
				conduction: "conduction 2.4s linear infinite",
				breathe: "breathe 3.2s ease-in-out infinite",
			},
		},
		colors: {
			tissue: "rgb(var(--tissue) / <alpha-value>)",
			"tissue-deep": "rgb(var(--tissue-deep) / <alpha-value>)",
			membrane: "rgb(var(--membrane) / <alpha-value>)",
			"membrane-deep": "rgb(var(--membrane-deep) / <alpha-value>)",
			signal: "rgb(var(--signal) / <alpha-value>)",
			myelin: "rgb(var(--myelin) / <alpha-value>)",
			synapse: "rgb(var(--synapse) / <alpha-value>)",
			impulse: "rgb(var(--impulse) / <alpha-value>)",

			transparent: "transparent",
			current: "currentColor",
			white: "#fff",
			black: "#000",
		},
	},
	plugins: [],
};
