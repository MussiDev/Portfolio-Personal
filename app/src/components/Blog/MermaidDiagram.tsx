"use client";

import { useEffect, useRef } from "react";

let idCounter = 0;

export default function MermaidDiagram({ code }: { code: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current || !code) return;
		let cancelled = false;

		import("mermaid").then(async ({ default: mermaid }) => {
			mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" });

			const id = `mermaid-${++idCounter}`;

			try {
				const { svg } = await mermaid.render(id, code);
				if (!cancelled && ref.current) ref.current.innerHTML = svg;
			} catch {
				if (!cancelled && ref.current) ref.current.textContent = "";
			}
		});

		return () => {
			cancelled = true;
		};
	}, [code]);

	return (
		<div
			ref={ref}
			className='my-6 flex justify-center overflow-x-auto rounded-lg bg-tejido-hondo/60 p-4'
		/>
	);
}
