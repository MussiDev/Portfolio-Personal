import React from "react";
import jobsItem from "../entities/jobsItem";

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, contact } = props;
	return (
		<div>
			<h4>{position}</h4>
			<h5>
				<span>{company}</span>/{time}
			</h5>
			<p>{description}</p>
			<span>{contact}</span>
		</div>
	);
};

export default Jobs;
