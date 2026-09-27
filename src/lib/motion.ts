// Shared motion helpers (REQ-DESIGN-006..008). CSS-only motion lives in
// src/routes/layout.css; this module covers the parts that need JS.

import type { Attachment } from 'svelte/attachments';

export const EASE_SOFT = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function prefersReducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Elements waiting to be revealed, mapped to the function that plays their
// entrance with a given stagger delay.
const pending = new Map<Element, (delay: number) => void>();
let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries) => {
			// Items that scroll into view together (e.g. a grid row) enter in
			// reading order, one after another.
			const entering = entries
				.filter((e) => e.isIntersecting)
				.sort(
					(a, b) =>
						a.boundingClientRect.top - b.boundingClientRect.top ||
						a.boundingClientRect.left - b.boundingClientRect.left
				);
			entering.forEach((entry, i) => {
				observer?.unobserve(entry.target);
				pending.get(entry.target)?.(i * 90);
				pending.delete(entry.target);
			});
		},
		{ rootMargin: '0px 0px -8% 0px' }
	);
	return observer;
}

// Fade + rise an element in the first time it scrolls into view:
// `<div {@attach reveal()}>`. Only content that starts below the fold is
// hidden, and only once JS runs, so the prerendered first paint is never
// blank and nothing stays hidden if scripts fail.
export function reveal(): Attachment<HTMLElement> {
	return (node) => {
		if (prefersReducedMotion()) return;
		if (node.getBoundingClientRect().top < window.innerHeight) return;

		node.style.opacity = '0';
		pending.set(node, (delay) => {
			node.style.opacity = '';
			node.animate(
				[
					{ opacity: 0, transform: 'translateY(1.5rem)' },
					{ opacity: 1, transform: 'none' }
				],
				{ duration: 900, delay, easing: EASE_SOFT, fill: 'backwards' }
			);
		});

		const io = getObserver();
		io.observe(node);
		return () => {
			io.unobserve(node);
			pending.delete(node);
		};
	};
}
