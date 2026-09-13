"use client";

import React, {
	Suspense,
	lazy,
	useActionState,
	useEffect,
	useRef,
	useState,
} from "react";

import emailjs from "@emailjs/browser";

import type { Language } from "../../../../entities/i18n";

const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

type State = { ok: boolean | null; message: string };

const COPY = {
	es: {
		name: "Nombre",
		email: "Email",
		message: "Mensaje",
		send: "Enviar mensaje",
		sending: "Enviando…",
		ok: "Llegó. Te respondo apenas lo lea — normalmente dentro de las 24 horas.",
		error: "No se pudo enviar. Probá de nuevo, o escribime por LinkedIn.",
		captcha: "Marcá el captcha antes de enviar.",
	},
	en: {
		name: "Name",
		email: "Email",
		message: "Message",
		send: "Send message",
		sending: "Sending…",
		ok: "It arrived. I answer as soon as I read it — usually within 24 hours.",
		error: "It could not be sent. Try again, or write to me on LinkedIn.",
		captcha: "Tick the captcha before sending.",
	},
};

const fieldClass =
	"w-full border border-sinapsis bg-membrana px-4 py-2.5 font-nota text-base text-senal placeholder:text-mielina/70 focus:border-impulso focus:outline-none focus:ring-2 focus:ring-impulso/40 transition-colors duration-200 ease-impulso";

const labelClass =
	"font-rotulo text-[11px] uppercase tracking-[.14em] text-mielina";

const ContactForm = ({ lang }: { lang: Language }) => {
	const [captchaOk, setCaptchaOk] = useState(false);
	const [darkTheme, setDarkTheme] = useState(false);
	const [mounted, setMounted] = useState(false);
	const boxRef = useRef<HTMLDivElement>(null);
	const [compact, setCompact] = useState(false);
	const c = COPY[lang];
	const sitekey = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

	useEffect(() => {
		const box = boxRef.current;
		if (!box) return;
		const decide = () => setCompact(box.clientWidth < 310);
		decide();
		const observer = new ResizeObserver(decide);
		observer.observe(box);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		setMounted(true);
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		setDarkTheme(mq.matches);
		const onChange = (e: MediaQueryListEvent) => setDarkTheme(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	const [state, send, sending] = useActionState<State, FormData>(
		async (_prev, formData) => {
			if (formData.get("lastName")) return { ok: true, message: c.ok };

			if (sitekey && !captchaOk) return { ok: false, message: c.captcha };

			const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
			const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
			const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

			if (!serviceId || !templateId || !publicKey) {
				return { ok: false, message: c.error };
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
				setCaptchaOk(false);
				return { ok: true, message: c.ok };
			} catch {
				return { ok: false, message: c.error };
			}
		},
		{ ok: null, message: "" },
	);

	return (
		<form
			action={send}
			className='flex max-w-[54ch] flex-col gap-6 border border-sinapsis bg-membrana/40 px-7 py-7'
		>
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

			{sitekey && (
				<div ref={boxRef} className='captcha'>
					{mounted ? (
						<Suspense
							fallback={
								<div
									className={`max-w-full bg-membrana-honda ${
										compact ? "h-[144px] w-[164px]" : "h-[78px] w-[304px]"
									}`}
								/>
							}
						>
							<ReCAPTCHA
								key={`${darkTheme ? "dark" : "light"}-${compact ? "c" : "n"}`}
								size={compact ? "compact" : "normal"}
								sitekey={sitekey}
								theme={darkTheme ? "dark" : "light"}
								onChange={() => setCaptchaOk(true)}
								onExpired={() => setCaptchaOk(false)}
							/>
						</Suspense>
					) : (
						<div
							className={`max-w-full bg-membrana-honda ${
								compact ? "h-[144px] w-[164px]" : "h-[78px] w-[304px]"
							}`}
						/>
					)}
				</div>
			)}

			<button
				type='submit'
				disabled={sending}
				className='flex h-12 items-center justify-center gap-2 border-[1.5px] border-impulso bg-impulso/[.07] font-rotulo text-sm font-semibold uppercase tracking-[.1em] text-impulso transition-colors duration-200 ease-impulso hover:bg-impulso/[.16] disabled:cursor-not-allowed disabled:border-sinapsis disabled:bg-transparent disabled:text-mielina'
			>
				{sending ? c.sending : c.send}
			</button>

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
