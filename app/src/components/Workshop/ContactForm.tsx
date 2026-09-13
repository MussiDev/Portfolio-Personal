"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import emailjs from "@emailjs/browser";
import Script from "next/script";

import type { Language } from "../../../../entities/i18n";

type State = { ok: boolean | null; message: string };

declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void;
			execute: (siteKey: string, options: { action: string }) => Promise<string>;
		};
	}
}

const CAPTCHA_ACTION = "contact";

const COPY = {
	es: {
		name: "Nombre",
		email: "Email",
		message: "Mensaje",
		send: "Enviar mensaje",
		sending: "Enviando…",
		ok: "Llegó. Te respondo apenas lo lea — normalmente dentro de las 24 horas.",
		error: "No se pudo enviar. Probá de nuevo, o escribime por LinkedIn.",
		captcha: "No pudimos verificar que no sos un robot. Probá de nuevo.",
		proteccion: "Este sitio está protegido por reCAPTCHA. Aplican la",
		privacidad: "Política de privacidad",
		y: "y los",
		terminos: "Términos del servicio",
		deGoogle: "de Google.",
	},
	en: {
		name: "Name",
		email: "Email",
		message: "Message",
		send: "Send message",
		sending: "Sending…",
		ok: "It arrived. I answer as soon as I read it — usually within 24 hours.",
		error: "It could not be sent. Try again, or write to me on LinkedIn.",
		captcha: "We could not verify you are not a robot. Try again.",
		proteccion: "This site is protected by reCAPTCHA. Google's",
		privacidad: "Privacy Policy",
		y: "and",
		terminos: "Terms of Service",
		deGoogle: "apply.",
	},
};

const fieldClass =
	"w-full border border-sinapsis bg-membrana px-4 py-2.5 font-nota text-base text-senal placeholder:text-mielina/70 focus:border-impulso focus:outline-none focus:ring-2 focus:ring-impulso/40 transition-colors duration-200 ease-impulso";

const labelClass =
	"font-rotulo text-[11px] uppercase tracking-[.14em] text-mielina";

const linkClass = "underline decoration-sinapsis/50 hover:text-impulso";

const getCaptchaToken = async (siteKey: string): Promise<string | null> => {
	if (!window.grecaptcha) return null;
	try {
		return await new Promise<string>((resolve, reject) => {
			window.grecaptcha!.ready(() => {
				window.grecaptcha!
					.execute(siteKey, { action: CAPTCHA_ACTION })
					.then(resolve, reject);
			});
		});
	} catch {
		return null;
	}
};

const verifyCaptcha = async (siteKey: string): Promise<boolean> => {
	const token = await getCaptchaToken(siteKey);
	if (!token) return false;

	try {
		const res = await fetch("/api/verify-captcha", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { success: boolean };
		return data.success;
	} catch {
		return false;
	}
};

const ContactForm = ({ lang }: { lang: Language }) => {
	const [wantsCaptcha, setWantsCaptcha] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const c = COPY[lang];
	const sitekey = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

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
			if (formData.get("lastName")) return { ok: true, message: c.ok };

			const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
			const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
			const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

			if (!serviceId || !templateId || !publicKey) {
				return { ok: false, message: c.error };
			}

			if (sitekey) {
				const verified = await verifyCaptcha(sitekey);
				if (!verified) return { ok: false, message: c.captcha };
			}

			try {
				await emailjs.send(
					serviceId,
					templateId,
					{
						user_name: String(formData.get("user_name") ?? ""),
						user_email: String(formData.get("user_email") ?? ""),
						message: String(formData.get("message") ?? ""),
					},
					publicKey,
				);
				return { ok: true, message: c.ok };
			} catch {
				return { ok: false, message: c.error };
			}
		},
		{ ok: null, message: "" },
	);

	return (
		<form
			ref={formRef}
			action={send}
			onFocus={() => setWantsCaptcha(true)}
			className='flex max-w-[54ch] flex-col gap-6 border border-sinapsis bg-membrana/40 px-7 py-7'
		>
			{sitekey && wantsCaptcha && (
				<Script
					src={`https://www.google.com/recaptcha/api.js?render=${sitekey}`}
					strategy='lazyOnload'
				/>
			)}

			<div className='flex flex-col gap-1.5'>
				<label className={labelClass} htmlFor='name'>
					{c.name}
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
					{c.email}
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
					{c.message}
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
				className='flex h-12 items-center justify-center gap-2 border-[1.5px] border-impulso bg-impulso/[.07] font-rotulo text-sm font-semibold uppercase tracking-[.1em] text-impulso transition-colors duration-200 ease-impulso hover:bg-impulso/[.16] disabled:cursor-not-allowed disabled:border-sinapsis disabled:bg-transparent disabled:text-mielina'
			>
				{sending ? c.sending : c.send}
			</button>

			{sitekey && (
				<p className='m-0 font-pieza text-[10px] leading-relaxed text-mielina'>
					{c.proteccion}{" "}
					<a
						href='https://policies.google.com/privacy'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{c.privacidad}
					</a>{" "}
					{c.y}{" "}
					<a
						href='https://policies.google.com/terms'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{c.terminos}
					</a>{" "}
					{c.deGoogle}
				</p>
			)}

			{state.ok !== null && (
				<p
					aria-live='polite'
					className={`m-0 font-nota text-[15px] leading-relaxed ${
						state.ok ? "text-mielina" : "text-impulso"
					}`}
				>
					{state.message}
				</p>
			)}
		</form>
	);
};

export default ContactForm;
