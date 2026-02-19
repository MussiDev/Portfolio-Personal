import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Joaquín Mussi - Software Engineer | Full Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					background: "#040508",
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "60px",
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{
						color: "#F24F0F",
						fontSize: 18,
						letterSpacing: 10,
						textTransform: "uppercase",
						marginBottom: 24,
					}}
				>
					Software Engineer
				</div>

				<div
					style={{
						color: "#ffffff",
						fontSize: 80,
						fontWeight: 700,
						marginBottom: 24,
						textAlign: "center",
					}}
				>
					Joaquín Mussi
				</div>

				<div
					style={{
						color: "#94a3b8",
						fontSize: 28,
						marginBottom: 48,
					}}
				>
					Next.js · React · TypeScript · .NET · C#
				</div>

				<div
					style={{
						display: "flex",
						gap: 12,
					}}
				>
					{["Next.js", "React", "TypeScript", ".NET", "C#", "Tailwind CSS"].map(
						(tag) => (
							<div
								key={tag}
								style={{
									border: "1px solid #334155",
									borderRadius: 999,
									color: "#94a3b8",
									fontSize: 16,
									padding: "6px 18px",
								}}
							>
								{tag}
							</div>
						),
					)}
				</div>

				<div
					style={{
						position: "absolute",
						bottom: 48,
						color: "#F24F0F",
						fontSize: 18,
					}}
				>
					joaquinmussi.vercel.app
				</div>
			</div>
		),
		{ ...size },
	);
}
