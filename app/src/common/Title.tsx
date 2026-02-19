import React from "react";
import title from "../../../entities/title";

const Title = ({ title, color, tag: Tag = "h2" }: title) => {
	return <Tag className={`py-4 ${color && `text-${color}`}`}>{title}</Tag>;
};

export default Title;
