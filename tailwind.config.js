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
		},
		colors: {
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
			white: "#fff",
			black: "#000",
		},
	},
	plugins: [],
};
