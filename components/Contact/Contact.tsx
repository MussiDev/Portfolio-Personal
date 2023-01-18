import React, { useRef } from "react";
import Title from "../../common/Title";
import emailjs from "@emailjs/browser";

const Contact = () => {
	const form = useRef<HTMLFormElement | null>(null);
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
				.then(
					(result) => {
						console.log(result.text);
					},
					(error) => {
						console.log(error.text);
					}
				);
		}
		e.currentTarget.reset();
	};
	return (
		<section
			className='max-w-[1240px] m-auto px-4 md:h-screen  flex flex-col items-center justify-center'
			id='contactme'>
			<Title title='Do you like contact me?' color='orange-700' />
			<div className='w-full max-w-xs '>
				<form className='py-6' ref={form} onSubmit={sendEmail}>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold'>Name</label>
						<input
							className=' appearance-none border rounded w-full py-2 px-3 text-orange-700 leading-tight focus:outline-none focus:shadow-outline'
							id='name'
							type='text'
							name='user_name'
							placeholder=''
							required
						/>
					</div>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold'>Email</label>
						<input
							className=' appearance-none border rounded w-full py-2 px-3 text-orange-700 leading-tight focus:outline-none focus:shadow-outline'
							id='email'
							type='email'
							name='user_email'
							placeholder=''
							required
						/>
					</div>
					<div className='mb-4 flex flex-col gap-4'>
						<label className='text-lg font-bold'>Mensaje</label>
						<textarea
							name='message'
							required
							className=' min-h-[6rem] max-h-56 appearance-none border rounded w-full py-2 px-3 text-orange-700 leading-tight focus:outline-none focus:shadow-outline'
						/>
					</div>
					<div className='flex items-center justify-center'>
						<input
							type='submit'
							value='Send'
							className='text-xl flex items-center gap-2 text-md hover:scale-110 hover:bg-white hover:text-orange-700 transition-all text-white bg-orange-700 px-12 py-2 rounded-full'
						/>
					</div>
				</form>
			</div>
		</section>
	);
};

export default Contact;
