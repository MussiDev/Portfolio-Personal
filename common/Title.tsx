import React from "react";
import title from "../entities/title";

const Title = (props: title) => {
	const { title, text } = props;
	return (
		<h3 className='text-2xl'>
			{title}
			<span className='text-orange-700 '> {text}</span>
		</h3>
	);
};

export default Title;
