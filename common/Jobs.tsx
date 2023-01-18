import React from "react";
import jobsItem from "../entities/jobsItem";

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, icons } = props;
	return (
		<section className='flex gap-6 flex-col md:flex'>
			<h4 className='flex items-center gap-6'>
				{position}
				{icons}
			</h4>
			<div>
				<h5 className='text-orange-700'>{company}</h5>
				<span>/ {time}</span>
				<p>{description}</p>
			</div>
		</section>
	);
};

export default Jobs;
