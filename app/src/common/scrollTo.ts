export function scrollTo(id: string, offset = -70) {
	const el = document.getElementById(id);
	if (!el) return;
	const top = el.getBoundingClientRect().top + window.scrollY + offset;
	window.scrollTo({ top, behavior: "smooth" });
}
