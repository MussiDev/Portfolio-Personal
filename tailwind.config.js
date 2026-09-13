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
				rotulo: ["var(--font-rotulo)", "Helvetica Neue", "Arial", "sans-serif"],
				nota: ["var(--font-rotulo)", "Helvetica Neue", "Arial", "sans-serif"],
				glosa: ["var(--font-glosa)", "Georgia", "Times New Roman", "serif"],
				pieza: ["var(--font-pieza)", "SFMono-Regular", "Consolas", "monospace"],
			},
			transitionTimingFunction: {
				impulso: "cubic-bezier(.16, 1, .3, 1)",
			},
			keyframes: {
				disparo: {
					"0%, 100%": { opacity: ".25", transform: "scale(1)" },
					"8%": { opacity: "1", transform: "scale(1.9)" },
					"30%": { opacity: ".35", transform: "scale(1)" },
				},
				conduccion: {
					to: { strokeDashoffset: "0" },
				},
				respirar: {
					"0%, 100%": { opacity: ".45" },
					"50%": { opacity: "1" },
				},
			},
			animation: {
				disparo: "disparo 4s cubic-bezier(.16,1,.3,1) infinite",
				conduccion: "conduccion 2.4s linear infinite",
				respirar: "respirar 3.2s ease-in-out infinite",
			},
		},
		colors: {
			tejido: "rgb(var(--tejido) / <alpha-value>)",
			"tejido-hondo": "rgb(var(--tejido-hondo) / <alpha-value>)",
			membrana: "rgb(var(--membrana) / <alpha-value>)",
			"membrana-honda": "rgb(var(--membrana-honda) / <alpha-value>)",
			senal: "rgb(var(--senal) / <alpha-value>)",
			mielina: "rgb(var(--mielina) / <alpha-value>)",
			sinapsis: "rgb(var(--sinapsis) / <alpha-value>)",
			impulso: "rgb(var(--impulso) / <alpha-value>)",

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
