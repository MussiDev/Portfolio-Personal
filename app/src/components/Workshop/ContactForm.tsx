"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";

import { CAPTCHA_ACTION } from "../../../../entities/contact";

type State = { ok: boolean | null; message: string };

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void;
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

/**
 * The copy arrives via props from ContactSection (a server component),
 * which already has the dictionary. Via props and not by importing
 * getDict: this is a client component, and that import would send both
 * complete languages to the browser bundle to use a handful of strings.
 */
export type FormCopy = {
	name: string;
	email: string;
	message: string;
	send: string;
	sending: string;
	ok: string;
	error: string;
	captcha: string;
	protectedBy: string;
	privacyPolicy: string;
	and: string;
	termsOfService: string;
	byGoogle: string;
};

const fieldClass =
	"w-full border border-synapse bg-membrane px-4 py-2.5 font-label text-base text-signal placeholder:text-myelin/70 focus:border-impulse focus:outline-none focus:ring-2 focus:ring-impulse/40 transition-colors duration-200 ease-impulse";

const labelClass = "font-label text-[11px] uppercase tracking-[.14em] text-myelin";

const linkClass = "underline decoration-synapse/50 hover:text-impulse";

/**
 * reCAPTCHA v3: there's no widget. The key registered with Google is v3,
 * and Google refuses to mount a v2 widget (the old checkbox) with a v3
 * key — that's why the captcha never showed up in production. Here a token
 * is requested on submit; /api/contact verifies it and only then sends the
 * mail.
 */
const getCaptchaToken = async (siteKey: string): Promise<string | null> => {
	if (!window.grecaptcha) return null;
	try {
		return await new Promise<string>((resolve, reject) => {
			window.grecaptcha!.ready(() => {
				window.grecaptcha!.execute(siteKey, { action: CAPTCHA_ACTION }).then(resolve, reject);
			});
		});
	} catch {
		return null;
	}
};

const ContactForm = ({ copy }: { copy: FormCopy }) => {
	const [wantsCaptcha, setWantsCaptcha] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const sitekey = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

	// Google's script is only requested once the form is about to be seen:
	// no one who never reaches the contact step downloads it.
	useEffect(() => {
		if (wantsCaptcha) return;
		const form = formRef.current;
		if (!form || typeof IntersectionObserver === "undefined") {
			setWantsCaptcha(true);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setWantsCaptcha(true);
				observer.disconnect();
			},
			{ rootMargin: "200px" },
		);
		observer.observe(form);
		return () => observer.disconnect();
	}, [wantsCaptcha]);

	const [state, send, sending] = useActionState<State, FormData>(
		async (_prev, formData) => {
			if (formData.get("lastName")) return { ok: true, message: copy.ok };

			// Without a token there is nothing the server could verify: skip the
			// round trip. The server rejects a missing token anyway (fail closed).
			const token = sitekey ? await getCaptchaToken(sitekey) : null;
			if (!token) return { ok: false, message: copy.captcha };

			try {
				const res = await fetch("/api/contact", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: String(formData.get("user_name") ?? ""),
						email: String(formData.get("user_email") ?? ""),
						message: String(formData.get("message") ?? ""),
						token,
					}),
				});
				if (res.ok) return { ok: true, message: copy.ok };
				return { ok: false, message: res.status === 403 ? copy.captcha : copy.error };
			} catch {
				return { ok: false, message: copy.error };
			}
		},
		{ ok: null, message: "" },
	);

	return (
		<form
			ref={formRef}
			action={send}
			onFocus={() => setWantsCaptcha(true)}
			className='flex max-w-[54ch] flex-col gap-6 border border-synapse bg-membrane/40 px-7 py-7'
		>
			{sitekey && wantsCaptcha && (
				<Script
					src={`https://www.google.com/recaptcha/api.js?render=${sitekey}`}
					strategy='lazyOnload'
				/>
			)}

			<div className='flex flex-col gap-1.5'>
				<label className={labelClass} htmlFor='name'>
					{copy.name}
				</label>
				<input
					className={fieldClass}
					id='name'
					type='text'
					name='user_name'
					autoComplete='name'
					required
				/>
			</div>

			<div className='flex flex-col gap-1.5'>
				<label className={labelClass} htmlFor='email'>
					{copy.email}
				</label>
				<input
					className={fieldClass}
					id='email'
					type='email'
					name='user_email'
					autoComplete='email'
					required
				/>
			</div>

			<div className='flex flex-col gap-1.5'>
				<label className={labelClass} htmlFor='message'>
					{copy.message}
				</label>
				<textarea
					className={`${fieldClass} resize-none`}
					id='message'
					name='message'
					rows={5}
					required
				/>
			</div>

			<input
				type='text'
				name='lastName'
				tabIndex={-1}
				autoComplete='off'
				aria-hidden='true'
				className='absolute h-0 w-0 opacity-0'
			/>

			<button
				type='submit'
				disabled={sending}
				className='flex h-12 items-center justify-center gap-2 border-[1.5px] border-impulse bg-impulse/[.07] font-label text-sm font-semibold uppercase tracking-[.1em] text-impulse transition-colors duration-200 ease-impulse hover:bg-impulse/[.16] disabled:cursor-not-allowed disabled:border-synapse disabled:bg-transparent disabled:text-myelin'
			>
				{sending ? copy.sending : copy.send}
			</button>

			{/* The reCAPTCHA badge is hidden (globals.css), and Google requires
			 * this notice when it isn't shown. */}
			{sitekey && (
				<p className='m-0 font-mono text-[10px] leading-relaxed text-myelin'>
					{copy.protectedBy}{" "}
					<a
						href='https://policies.google.com/privacy'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{copy.privacyPolicy}
					</a>{" "}
					{copy.and}{" "}
					<a
						href='https://policies.google.com/terms'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{copy.termsOfService}
					</a>{" "}
					{copy.byGoogle}
				</p>
			)}

			{/* The live region ALWAYS exists in the DOM, even when empty: a
			 * screen reader only announces changes inside a live region that
			 * was already mounted. Mounted together with its content, the
			 * user submits and finds out nothing — neither success nor error. */}
			<p
				role='status'
				aria-live='polite'
				className={`m-0 font-label text-[15px] leading-relaxed ${
					state.ok === null ? "sr-only" : state.ok ? "text-myelin" : "text-impulse"
				}`}
			>
				{state.message}
			</p>
		</form>
	);
};

export default ContactForm;
