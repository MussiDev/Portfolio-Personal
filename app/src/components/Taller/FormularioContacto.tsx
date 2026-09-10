"use client";

import React, {
	Suspense,
	lazy,
	useActionState,
	useEffect,
	useState,
} from "react";

import emailjs from "@emailjs/browser";

import type { Idioma } from "../../../../entities/i18n";

// El captcha pesa ~250 KB y no hace falta para pintar la página: entra
// después y solo en el navegador. `lazy` en vez de `next/dynamic` porque
// el segundo hace bail-out del render de servidor dentro de un componente
// cliente y tira la página entera.
const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

type Estado = { ok: boolean | null; mensaje: string };

const COPY = {
	es: {
		nombre: "Nombre",
		email: "Email",
		mensaje: "Mensaje",
		enviar: "Enviar mensaje",
		enviando: "Enviando…",
		ok: "Llegó. Te respondo apenas lo lea — normalmente dentro de las 24 horas.",
		error: "No se pudo enviar. Probá de nuevo, o escribime por LinkedIn.",
		captcha: "Marcá el captcha antes de enviar.",
	},
	en: {
		nombre: "Name",
		email: "Email",
		mensaje: "Message",
		enviar: "Send message",
		enviando: "Sending…",
		ok: "It arrived. I answer as soon as I read it — usually within 24 hours.",
		error: "It could not be sent. Try again, or write to me on LinkedIn.",
		captcha: "Tick the captcha before sending.",
	},
};

const campo =
	"w-full border border-linea bg-hoja px-4 py-2.5 font-nota text-base text-texto placeholder:text-texto-medio/70 focus:border-marca focus:outline-none focus:ring-2 focus:ring-marca/40 transition-colors duration-200 ease-mecanico";

const etiqueta =
	"font-rotulo text-[11px] uppercase tracking-[.14em] text-texto-medio";

const FormularioContacto = ({ lang }: { lang: Idioma }) => {
	const [captchaOk, setCaptchaOk] = useState(false);
	const [temaOscuro, setTemaOscuro] = useState(false);
	const [montado, setMontado] = useState(false);
	const c = COPY[lang];
	const sitekey = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

	// El captcha no lee tokens CSS: hay que decirle el tema a mano.
	useEffect(() => {
		setMontado(true);
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		setTemaOscuro(mq.matches);
		const alCambiar = (e: MediaQueryListEvent) => setTemaOscuro(e.matches);
		mq.addEventListener("change", alCambiar);
		return () => mq.removeEventListener("change", alCambiar);
	}, []);

	/**
	 * React 19 maneja el pendiente y el resultado: se va todo el `useState`
	 * de loading y el `onSubmit` a mano.
	 */
	const [estado, enviar, enviando] = useActionState<Estado, FormData>(
		async (_previo, datos) => {
			// Trampa para bots: un campo que una persona nunca ve ni completa.
			if (datos.get("apellido")) return { ok: true, mensaje: c.ok };

			if (sitekey && !captchaOk) return { ok: false, mensaje: c.captcha };

			const { NEXT_PUBLIC_SERVICE_ID, NEXT_PUBLIC_TEMPLATE_ID, NEXT_PUBLIC_PUBLIC_KEY } =
				process.env;

			if (!NEXT_PUBLIC_SERVICE_ID || !NEXT_PUBLIC_TEMPLATE_ID || !NEXT_PUBLIC_PUBLIC_KEY) {
				return { ok: false, mensaje: c.error };
			}

			try {
				await emailjs.send(
					NEXT_PUBLIC_SERVICE_ID,
					NEXT_PUBLIC_TEMPLATE_ID,
					{
						user_name: String(datos.get("user_name") ?? ""),
						user_email: String(datos.get("user_email") ?? ""),
						message: String(datos.get("message") ?? ""),
					},
					NEXT_PUBLIC_PUBLIC_KEY,
				);
				setCaptchaOk(false);
				return { ok: true, mensaje: c.ok };
			} catch {
				return { ok: false, mensaje: c.error };
			}
		},
		{ ok: null, mensaje: "" },
	);

	return (
		<form
			action={enviar}
			className='flex max-w-[54ch] flex-col gap-6 border border-linea bg-hoja/40 px-7 py-7'
		>
			<div className='flex flex-col gap-1.5'>
				<label className={etiqueta} htmlFor='nombre'>
					{c.nombre}
				</label>
				<input
					className={campo}
					id='nombre'
					type='text'
					name='user_name'
					autoComplete='name'
					required
				/>
			</div>

			<div className='flex flex-col gap-1.5'>
				<label className={etiqueta} htmlFor='email'>
					{c.email}
				</label>
				<input
					className={campo}
					id='email'
					type='email'
					name='user_email'
					autoComplete='email'
					required
				/>
			</div>

			<div className='flex flex-col gap-1.5'>
				<label className={etiqueta} htmlFor='mensaje'>
					{c.mensaje}
				</label>
				<textarea
					className={`${campo} resize-none`}
					id='mensaje'
					name='message'
					rows={5}
					required
				/>
			</div>

			{/* Honeypot: invisible para personas, irresistible para bots. */}
			<input
				type='text'
				name='apellido'
				tabIndex={-1}
				autoComplete='off'
				aria-hidden='true'
				className='absolute h-0 w-0 opacity-0'
			/>

			{sitekey &&
				(montado ? (
					<Suspense
						fallback={<div className='h-[78px] w-[304px] bg-hoja-honda' />}
					>
						<ReCAPTCHA
							key={temaOscuro ? "dark" : "light"}
							sitekey={sitekey}
							theme={temaOscuro ? "dark" : "light"}
							onChange={() => setCaptchaOk(true)}
							onExpired={() => setCaptchaOk(false)}
						/>
					</Suspense>
				) : (
					<div className='h-[78px] w-[304px] bg-hoja-honda' />
				))}

			<button
				type='submit'
				disabled={enviando}
				className='flex h-12 items-center justify-center gap-2 border-[1.5px] border-marca bg-marca/[.07] font-rotulo text-sm font-semibold uppercase tracking-[.1em] text-marca transition-colors duration-200 ease-mecanico hover:bg-marca/[.16] disabled:cursor-not-allowed disabled:border-linea disabled:bg-transparent disabled:text-texto-medio'
			>
				{enviando ? c.enviando : c.enviar}
			</button>

			{/* El estado se dice en su lugar, no en un modal que aparece flotando. */}
			{estado.ok !== null && (
				<p
					aria-live='polite'
					className={`m-0 font-nota text-[15px] leading-relaxed ${
						estado.ok ? "text-texto-medio" : "text-marca"
					}`}
				>
					{estado.mensaje}
				</p>
			)}
		</form>
	);
};

export default FormularioContacto;
