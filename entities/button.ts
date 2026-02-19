interface button {
	title: string;
	icon?: string;
	href: string;
	blank?: boolean;
	more?: boolean;
	variant?: "primary" | "secondary" | "ghost";
}
export default button;
