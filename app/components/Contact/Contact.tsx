"use client"; // this is a client component
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("../../common/Title"));
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { ReCAPTCHA } from "react-google-recaptcha";
import { motion } from "framer-motion";

const Contact = () => {
	const [verifyCaptcha, setVerifyCaptcha] = useState(false);
	const form = useRef<HTMLFormElement | null>(null);

	const token = process.env.NEXT_PUBLIC_FIRSTCAPTCHA;
	const onChange = () => {
		setVerifyCaptcha(true);
	};
	const sendEmail = (e: React.MouseEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (
			form.current &&
			process.env.NEXT_PUBLIC_SERVICE_ID &&
			process.env.NEXT_PUBLIC_TEMPLATE_ID &&
			process.env.NEXT_PUBLIC_PUBLIC_KEY
		) {
			emailjs
				.sendForm(
					process.env.NEXT_PUBLIC_SERVICE_ID,
					process.env.NEXT_PUBLIC_TEMPLATE_ID,
					form.current,
					process.env.NEXT_PUBLIC_PUBLIC_KEY
				)
				.then(() => {
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
				});
		}
		e.currentTarget.reset();
	};
	return (
		<motion.section
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 2 }}
			className='max-w-[1240px] m-auto px-4 py-16 flex flex-col items-center justify-center'
			id='contactme'>
			<Title title='Do you like contact me?' color='orange-700' />
			<motion.div
				className='w-full max-w-xs '
				initial={{ opacity: 0, y: 200 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}>
				<form className='py-6' ref={form} onSubmit={sendEmail}>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold' htmlFor='name'>
							Name
						</label>
						<input
							className=' appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline text-black'
							id='name'
							type='text'
							name='user_name'
							placeholder=''
							required
						/>
					</div>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold' htmlFor='email'>
							Email
						</label>
						<input
							className=' appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline text-black'
							id='email'
							type='email'
							name='user_email'
							placeholder=''
							required
						/>
					</div>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold' htmlFor='message'>
							Mensaje
						</label>
						<textarea
							id='message'
							name='message'
							required
							className=' min-h-[6rem] max-h-56 appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline text-black'
						/>
					</div>
					{token && (
						<div className='py-4 '>
							<ReCAPTCHA
								onChange={onChange}
								sitekey={token}
								className='g-recaptcha'
							/>
						</div>
					)}
					<div className='flex items-center justify-center'>
						{verifyCaptcha ? (
							<input
								type='submit'
								value='Send'
								className='text-xl flex items-center gap-2 text-md hover:scale-110 hover:bg-white hover:text-orange-700 transition-all text-white bg-orange-700 px-12 py-2 rounded-full'
							/>
						) : (
							<input
								type='submit'
								value='Send'
								disabled
								className='disabled:opacity-50 text-xl flex items-center gap-2 text-md text-white bg-orange-700 px-12 py-2 rounded-full'
							/>
						)}
					</div>
				</form>
			</motion.div>
		</motion.section>
	);
};

export default Contact;
