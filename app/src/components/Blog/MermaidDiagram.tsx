"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

let idCounter = 0;

export default function MermaidDiagram({ code }: { code: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current || !code) return;

		mermaid.initialize({ startOnLoad: false, theme: "dark" });

		const id = `mermaid-${++idCounter}`;

		mermaid.render(id, code).then(({ svg }) => {
			if (ref.current) ref.current.innerHTML = svg;
		});
	}, [code]);

	return (
		<div
			ref={ref}
			className='my-6 flex justify-center overflow-x-auto rounded-lg bg-slate-800/50 p-4'
		/>
	);
}
