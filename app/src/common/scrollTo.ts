export function scrollTo(id: string, offset = -70, duration = 800) {
	const el = document.getElementById(id);
	if (!el) return;

	const startY = window.scrollY;
	const targetY = el.getBoundingClientRect().top + startY + offset;
	const distance = targetY - startY;
	let startTime: number | null = null;

	function easeInOutQuad(t: number) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	function step(timestamp: number) {
		if (!startTime) startTime = timestamp;
		const elapsed = timestamp - startTime;
		const progress = Math.min(elapsed / duration, 1);
		window.scrollTo(0, startY + distance * easeInOutQuad(progress));
		if (progress < 1) requestAnimationFrame(step);
	}

	requestAnimationFrame(step);
}
