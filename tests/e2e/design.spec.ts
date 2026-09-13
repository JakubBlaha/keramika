import { expect, test } from '@playwright/test';

// E2E tests for the visual design direction. Design tokens are defined in
// src/routes/layout.css via @theme. Test titles carry the requirement ID for
// traceability. See docs/requirements/design.md.

test.describe('Design', () => {
	test('REQ-DESIGN-001 - warm, earthy color palette tokens are applied', async ({ page }) => {
		await page.goto('/');

		// The design tokens are exposed as CSS custom properties on :root.
		const tokens = await page.evaluate(() => {
			const s = getComputedStyle(document.documentElement);
			return {
				bg: s.getPropertyValue('--color-bg').trim(),
				ink: s.getPropertyValue('--color-ink').trim(),
				accent: s.getPropertyValue('--color-accent').trim(),
				sage: s.getPropertyValue('--color-sage').trim()
			};
		});

		expect(tokens.bg.toLowerCase()).toBe('#faf8f5'); // warm off-white
		expect(tokens.ink.toLowerCase()).toBe('#3d3530'); // earthy dark ink
		expect(tokens.accent.toLowerCase()).toBe('#c4785a'); // terracotta accent
		expect(tokens.sage.toLowerCase()).toBe('#8a9a82'); // sage secondary

		// The body background actually resolves to the warm off-white.
		const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
		expect(bodyBg).toBe('rgb(250, 248, 245)');
	});

	test('REQ-DESIGN-002 - display headings and sans-serif body', async ({ page }) => {
		await page.goto('/');

		// The h1 uses the display (serif) font stack.
		const h1Font = await page.evaluate(() => {
			const h1 = document.querySelector('h1');
			return h1 ? getComputedStyle(h1).fontFamily : '';
		});
		expect(h1Font).toContain('Cormorant Garamond');

		// Body copy uses the sans-serif body font stack.
		const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
		expect(bodyFont).toContain('Jost');
	});
});
