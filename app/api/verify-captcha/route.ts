import { NextResponse } from "next/server";

const SCORE_THRESHOLD = 0.5;
const EXPECTED_ACTION = "contact";

type SiteVerifyResponse = {
	success: boolean;
	score?: number;
	action?: string;
};

export async function POST(request: Request) {
	const secret = process.env.RECAPTCHA_SECRET_KEY;
	if (!secret) {
		return NextResponse.json({ success: false }, { status: 500 });
	}

	const { token } = (await request.json().catch(() => ({}))) as { token?: string };
	if (!token) {
		return NextResponse.json({ success: false }, { status: 400 });
	}

	const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ secret, response: token }),
	});
	const data = (await verifyRes.json()) as SiteVerifyResponse;

	const success =
		data.success &&
		(data.score ?? 0) >= SCORE_THRESHOLD &&
		data.action === EXPECTED_ACTION;

	return NextResponse.json({ success });
}
