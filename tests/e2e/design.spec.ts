import { expect, test, type Page } from '@playwright/test';

// E2E tests for the visual design direction. Design tokens are defined in
// src/routes/layout.css via @theme. Test titles carry the requirement ID for
// traceability. See docs/requirements/design.md.

// Wait until SvelteKit has hydrated (the root layout sets this attribute in an
// $effect); before that, clicks land on inert prerendered HTML.
async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page.waitForFunction(() => document.documentElement.dataset.firebaseEmulator !== undefined);
}

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

	test('REQ-DESIGN-007 - product card photo morphs into the detail page', async ({ page }) => {
		await gotoHydrated(page, '/produkty/zviratka');
		const cardImg = page.locator('a[href="/produkt/kocicka"] img');
		await expect(cardImg).toHaveCSS('view-transition-name', 'product-kocicka');

		// Count view transitions started by client-side navigation.
		await page.evaluate(() => {
			const w = window as unknown as { vt: number };
			w.vt = 0;
			const start = document.startViewTransition.bind(document);
			document.startViewTransition = ((cb: () => Promise<void>) => {
				w.vt++;
				return start(cb);
			}) as typeof document.startViewTransition;
		});
		await page.locator('a[href="/produkt/kocicka"]').click();
		await expect(page).toHaveURL(/\/produkt\/kocicka$/);
		expect(await page.evaluate(() => (window as unknown as { vt: number }).vt)).toBe(1);
		await expect(page.locator('article img[loading="eager"]')).toHaveCSS(
			'view-transition-name',
			'product-kocicka'
		);
	});

	test('REQ-DESIGN-008 - below-fold cards reveal on scroll, hero is never hidden', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');

		const card = page.locator('main a[href^="/produkt/"]').first();
		await expect(card).toHaveCSS('opacity', '0');
		await card.scrollIntoViewIfNeeded();
		await expect(card).toHaveCSS('opacity', '1');
	});
});

test.describe('Design (reduced motion)', () => {
	test.use({ reducedMotion: 'reduce' });

	test('REQ-DESIGN-006 - content is shown without motion', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		// Below the fold, yet visible straight away: nothing waits for a reveal.
		await expect(page.locator('main a[href^="/produkt/"]').first()).toHaveCSS('opacity', '1');
	});
});
