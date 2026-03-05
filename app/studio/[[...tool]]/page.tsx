"use client";

import dynamic from "next/dynamic";

const StudioComponent = dynamic(() => import("./StudioComponent"), {
	ssr: false,
});

export default function StudioPage() {
	return <StudioComponent />;
}
