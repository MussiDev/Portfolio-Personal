"use client";

import dynamic from "next/dynamic";

const BrainCanvas = dynamic(() => import("./Brain3D"), {
	ssr: false,
	loading: () => null,
});

export default BrainCanvas;
