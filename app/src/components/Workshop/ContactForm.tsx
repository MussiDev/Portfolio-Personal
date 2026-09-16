"use client";

import React, {
	Suspense,
	lazy,
	useActionState,
	useEffect,
	useRef,
	useState,
} from "react";

import { useIsMounted, useMediaQuery } from "../../hooks/useMediaQuery";
import { shouldBlockSubmission } from "./captchaGate";

const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

type State = { ok: boolean | null; message: string };

/**
 * El copy llega por props desde ContactoSection (server component), que ya
 * tiene el diccionario. Antes este archivo tenía su propio objeto COPY con
 * es/en hardcodeado: dos sistemas de i18n en paralelo, y una traducción que
 * se podía cambiar en dict.ts sin que este formulario se enterara.
 *
 * Por props y no importando getDict: esto es un client component, y un
 * import del diccionario mandaría los dos idiomas completos al bundle del
 * navegador para usar ocho strings.
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
};

const fieldClass =
	"w-full border border-sinapsis bg-membrana px-4 py-2.5 font-nota text-base text-senal placeholder:text-mielina/70 focus:border-impulso focus:outline-none focus:ring-2 focus:ring-impulso/40 transition-colors duration-200 ease-impulso";

const labelClass =
	"font-rotulo text-[11px] uppercase tracking-[.14em] text-mielina";

const ContactForm = ({ copy }: { copy: FormCopy }) => {
	const [captchaOk, setCaptchaOk] = useState(false);
	const [wantsCaptcha, setWantsCaptcha] = useState(false);
	// Suscripciones, no estado sincronizado a mano dentro de un efecto: el
	// widget de reCAPTCHA no puede renderizarse en el server, y su tema
	// sigue al del sistema.
	const mounted = useIsMounted();
	const darkTheme = useMediaQuery("(prefers-color-scheme: dark)") ?? false;
	const boxRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [compact, setCompact] = useState(false);
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

			if (shouldBlockSubmission(sitekey, captchaOk)) {
				return { ok: false, message: copy.captcha };
			}

			const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
			const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
			const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

			if (!serviceId || !templateId || !publicKey) {
				return { ok: false, message: copy.error };
			}

			try {
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
				setCaptchaOk(false);
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

			{sitekey && (
				<div ref={boxRef} className='captcha'>
					{mounted && wantsCaptcha ? (
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
				{sending ? copy.enviando : copy.enviar}
			</button>

			{/* La región live existe SIEMPRE en el DOM, aunque esté vacía: un
			 * lector de pantalla solo anuncia cambios dentro de una live region
			 * que ya estaba montada. Si se monta junto con su contenido (como
			 * hacía antes), el usuario envía el formulario y no se entera de
			 * nada — ni del éxito ni del error. */}
			<p
				role='status'
				aria-live='polite'
				className={`m-0 font-nota text-[15px] leading-relaxed ${
					state.ok === null
						? "sr-only"
						: state.ok
							? "text-mielina"
							: "text-impulso"
				}`}
			>
				{state.message}
			</p>
		</form>
	);
};

export default ContactForm;
