"use client"; // this is a client component

import React, { useRef, useState } from "react";

import { FaArrowRight } from "react-icons/fa";
import ReCAPTCHABase from "react-google-recaptcha";

const ReCAPTCHA = ReCAPTCHABase as unknown as React.ElementType;
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

const Title = dynamic(() => import("../../common/Title"), { ssr: false });

const inputClass =
	"w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-700 transition-colors duration-200";

const Contact = () => {
	const [verifyCaptcha, setVerifyCaptcha] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const form = useRef<HTMLFormElement | null>(null);

	const token = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;

	const onChange = () => {
		setVerifyCaptcha(true);
	};

	const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			form.current &&
			process.env.NEXT_PUBLIC_SERVICE_ID &&
			process.env.NEXT_PUBLIC_TEMPLATE_ID &&
			process.env.NEXT_PUBLIC_PUBLIC_KEY
		) {
			setIsLoading(true);
			emailjs
				.sendForm(
					process.env.NEXT_PUBLIC_SERVICE_ID,
					process.env.NEXT_PUBLIC_TEMPLATE_ID,
					form.current,
					process.env.NEXT_PUBLIC_PUBLIC_KEY,
				)
				.then(() => {
					form.current?.reset();
					setVerifyCaptcha(false);
					Swal.fire({
						position: "center",
						background: "rgb(30 41 59)",
						icon: "success",
						text: "Thanks! I will contact you as soon as possible! ;)",
						showConfirmButton: false,
						timer: 4000,
						color: "rgb(194 65 12)",
						timerProgressBar: true,
					});
				})
				.catch(() => {
					Swal.fire({
						position: "center",
						background: "rgb(30 41 59)",
						icon: "error",
						title: "Oops...",
						text: "Something went wrong!",
						showConfirmButton: false,
						timer: 4000,
						color: "rgb(194 65 12)",
						timerProgressBar: true,
					});
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	};

	return (
		<motion.section
			className='max-w-[77.5rem] m-auto px-4 py-16'
			id='contactme'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<Title title='Contact me' color='orange-700' />

			<motion.div
				className='border border-slate-700 rounded-xl p-6 md:p-8 hover:border-orange-700 transition-colors duration-300 '
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				viewport={{ once: true }}
			>
				<p className='text-gray-400 text-sm mb-6'>
					Have a project in mind or want to get in touch? Fill out the form and
					I&apos;ll get back to you as soon as possible.
				</p>

				<form className='flex flex-col gap-5' ref={form} onSubmit={sendEmail}>
					<div className='flex flex-col gap-1.5'>
						<label
							className='text-sm font-semibold text-gray-300'
							htmlFor='name'
						>
							Name
						</label>
						<input
							className={inputClass}
							id='name'
							type='text'
							name='user_name'
							placeholder='John Doe'
							required
						/>
					</div>

					<div className='flex flex-col gap-1.5'>
						<label
							className='text-sm font-semibold text-gray-300'
							htmlFor='email'
						>
							Email
						</label>
						<input
							className={inputClass}
							id='email'
							type='email'
							name='user_email'
							placeholder='john@example.com'
							required
						/>
					</div>

					<div className='flex flex-col gap-1.5'>
						<label
							className='text-sm font-semibold text-gray-300'
							htmlFor='message'
						>
							Message
						</label>
						<textarea
							id='message'
							name='message'
							required
							rows={4}
							placeholder='Tell me about your project...'
							className={`${inputClass} resize-none`}
						/>
					</div>

					{token && (
						<div>
							<ReCAPTCHA
								onChange={onChange}
								sitekey={token}
								className='g-recaptcha'
								theme='dark'
							/>
						</div>
					)}

					<button
						type='submit'
						disabled={!verifyCaptcha || isLoading}
						className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
							verifyCaptcha && !isLoading
								? "bg-orange-700 text-white hover:bg-white hover:text-orange-700 cursor-pointer"
								: "bg-orange-700 text-white opacity-50 cursor-not-allowed"
						}`}
					>
						{isLoading ? "Sending..." : "Send message"}
						{!isLoading && <FaArrowRight size={14} />}
					</button>
				</form>
			</motion.div>
		</motion.section>
	);
};

export default Contact;
