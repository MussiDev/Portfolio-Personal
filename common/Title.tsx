import React from "react";
import title from "../entities/title";

const Title = (props: title) => {
	const { title, color} = props;
	return <h1 className={`py-4 ${color && `text-${color}`}`}>{title}</h1>;
};

export default Title;
