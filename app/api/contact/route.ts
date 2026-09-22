import { NextResponse } from "next/server";

import { ContactSchema, isHuman, type SiteVerifyResponse } from "../../../entities/contact";

/**
 * The only way a contact message leaves the site: parse → captcha → send.
 *
 * Before, the browser verified the captcha here and then called EmailJS
 * itself with the public key, so a bot could skip this endpoint entirely.
 * EmailJS is now called from the server with the private key. For that to
 * hold, the EmailJS account must enable "API access from non-browser
 * environments" and "Use Private Key" (the latter rejects browser calls
 * made with the public key alone).
 *
 * Responses the form maps to copy: 200 sent (or honeypot), 400 invalid,
 * 403 captcha, 500 not configured, 502 EmailJS failed.
 */

const MAX_BYTES = 16_384;

const verifyCaptcha = async (secret: string, token: string): Promise<boolean> => {
	try {
		const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ secret, response: token }),
		});
		return isHuman((await res.json()) as SiteVerifyResponse);
	} catch {
		return false;
	}
};

export async function POST(request: Request) {
	const raw = await request.text();
	if (raw.length > MAX_BYTES) return NextResponse.json({ ok: false }, { status: 413 });

	let body: unknown;
	try {
		body = JSON.parse(raw);
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}

	const parsed = ContactSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
	const { name, email, message, token, lastName } = parsed.data;

	// A bot filled the hidden field: answer like a success so it moves on.
	if (lastName) return NextResponse.json({ ok: true });

	const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
	const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
	const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
	const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
	const privateKey = process.env.EMAILJS_PRIVATE_KEY;
	if (!captchaSecret || !serviceId || !templateId || !publicKey || !privateKey) {
		return NextResponse.json({ ok: false }, { status: 500 });
	}

	if (!(await verifyCaptcha(captchaSecret, token))) {
		return NextResponse.json({ ok: false }, { status: 403 });
	}

	try {
		const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				service_id: serviceId,
				template_id: templateId,
				user_id: publicKey,
				accessToken: privateKey,
				template_params: { user_name: name, user_email: email, message },
			}),
		});
		if (!res.ok) {
			console.error("EmailJS send failed:", res.status, await res.text().catch(() => ""));
			return NextResponse.json({ ok: false }, { status: 502 });
		}
	} catch (e) {
		console.error("EmailJS send threw:", e);
		return NextResponse.json({ ok: false }, { status: 502 });
	}

	return NextResponse.json({ ok: true });
}
