import { StaticImageData } from "next/image";

interface projectItem {
	src: StaticImageData;
	paragraph?: string;
	github: string;
	page: string;
	icon: React.ReactNode;
}
export default projectItem;
