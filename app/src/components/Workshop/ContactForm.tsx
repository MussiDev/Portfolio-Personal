"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";

import { shouldBlockSubmission } from "./captchaGate";

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

/**
 * El copy llega por props desde ContactoSection (server component), que ya
 * tiene el diccionario. Por props y no importando getDict: esto es un client
 * component, y ese import mandaría los dos idiomas completos al bundle del
 * navegador para usar un puñado de strings.
 */
export type FormCopy = {
	nombre: string;
	email: string;
	mensaje: string;
	enviar: string;
	enviando: string;
	ok: string;
	error: string;
	captcha: string;
	proteccion: string;
	privacidad: string;
	y: string;
	terminos: string;
	deGoogle: string;
};

const fieldClass =
	"w-full border border-sinapsis bg-membrana px-4 py-2.5 font-rotulo text-base text-senal placeholder:text-mielina/70 focus:border-impulso focus:outline-none focus:ring-2 focus:ring-impulso/40 transition-colors duration-200 ease-impulso";

const labelClass = "font-rotulo text-[11px] uppercase tracking-[.14em] text-mielina";

const linkClass = "underline decoration-sinapsis/50 hover:text-impulso";

/**
 * reCAPTCHA v3: no hay widget. La clave registrada en Google es v3, y un
 * widget v2 (el checkbox de antes) Google se niega a montarlo con una clave
 * v3 — por eso el captcha nunca apareció en producción. Acá se pide un token
 * al enviar y se verifica en el server (/api/verify-captcha) con umbral de
 * score y chequeo de acción.
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

const ContactForm = ({ copy }: { copy: FormCopy }) => {
	const [wantsCaptcha, setWantsCaptcha] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);
	const sitekey = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

	// El script de Google se pide recién cuando el formulario está por verse:
	// nadie que no llegue al paso de contacto lo descarga.
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

			const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
			const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
			const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
			if (!serviceId || !templateId || !publicKey) {
				return { ok: false, message: copy.error };
			}

			// Fail closed: sin sitekey no hay forma de verificar nada, así que se
			// bloquea en vez de mandar sin captcha. Es una regresión que ya pasó
			// una vez (la variable ausente dejaba pasar cualquier envío) y que
			// captchaGate.test.ts fija.
			const verificado = sitekey ? await verifyCaptcha(sitekey) : false;
			if (shouldBlockSubmission(sitekey, verificado)) {
				return { ok: false, message: copy.captcha };
			}

			try {
				// Se importa recién al enviar: no pesa en el bundle de quien solo mira.
				const { default: emailjs } = await import("@emailjs/browser");
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
				return { ok: true, message: copy.ok };
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
					{copy.nombre}
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
					{copy.mensaje}
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
				{sending ? copy.enviando : copy.enviar}
			</button>

			{/* El badge de reCAPTCHA va oculto (globals.css), y Google exige este
			 * aviso cuando no se muestra. */}
			{sitekey && (
				<p className='m-0 font-pieza text-[10px] leading-relaxed text-mielina'>
					{copy.proteccion}{" "}
					<a
						href='https://policies.google.com/privacy'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{copy.privacidad}
					</a>{" "}
					{copy.y}{" "}
					<a
						href='https://policies.google.com/terms'
						target='_blank'
						rel='noreferrer'
						className={linkClass}
					>
						{copy.terminos}
					</a>{" "}
					{copy.deGoogle}
				</p>
			)}

			{/* La región live existe SIEMPRE en el DOM, aunque esté vacía: un
			 * lector de pantalla solo anuncia cambios dentro de una live region
			 * que ya estaba montada. Montada junto con su contenido, el usuario
			 * envía y no se entera de nada — ni del éxito ni del error. */}
			<p
				role='status'
				aria-live='polite'
				className={`m-0 font-rotulo text-[15px] leading-relaxed ${
					state.ok === null ? "sr-only" : state.ok ? "text-mielina" : "text-impulso"
				}`}
			>
				{state.message}
			</p>
		</form>
	);
};

export default ContactForm;
