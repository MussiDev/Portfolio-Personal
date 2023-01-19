import React from "react";
import jobsItem from "../entities/jobsItem";

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, icons } = props;
	return (
		<section className='flex gap-6 flex-col md:flex md:items-center'>
			<div className='grid md:flex gap-6'>
				<h4>{position}</h4>
				<div className='flex gap-6 items-center '>{icons}</div>
			</div>
			<div>
				<h5 className='text-orange-700'>{company}</h5>
				<span>/ {time}</span>
				<p>{description}</p>
			</div>
		</section>
	);
};

export default Jobs;
