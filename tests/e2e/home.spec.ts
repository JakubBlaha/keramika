import { expect, test } from '@playwright/test';

// E2E tests for the homepage (src/routes/+page.svelte).
// Test titles include the requirement ID so traceability is greppable.
// See docs/requirements/home.md.

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('REQ-HOME-001 - hero shows headline and CTA to products', async ({ page }) => {
		// The hero headline is the page h1.
		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
		await expect(heading).toContainText('Keramika');

		// A call-to-action links to the products page (Czech: /produkty).
		const cta = page.getByRole('link', { name: 'Prohlédnout produkty' });
		await expect(cta).toBeVisible();
		await expect(cta).toHaveAttribute('href', '/produkty');
	});

	test('REQ-HOME-002 - shows the brand value propositions', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Tvořeno s láskou' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Vlastní tvorba' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Originální kusy' })).toBeVisible();
	});

	test('REQ-HOME-003 - featured products grid links to detail pages', async ({ page }) => {
		const featured = page.getByRole('heading', { name: 'Novinky z ateliéru' });
		await expect(featured).toBeVisible();

		// Product cards link to product detail pages.
		const section = page.locator('section', { has: featured });
		const productLinks = section.locator('a[href^="/produkt/"]');
		await expect(productLinks.first()).toBeVisible();

		// The cards fill at least two grid rows (distinct layout offsets;
		// offsetTop ignores the scroll-reveal transform).
		const tops = await productLinks.evaluateAll((links) =>
			links.map((a) => (a as HTMLElement).offsetTop)
		);
		expect(new Set(tops).size).toBeGreaterThanOrEqual(2);

		// A link to all products is shown.
		await expect(page.getByRole('link', { name: 'Všechny produkty' }).first()).toBeVisible();
	});

	test('REQ-HOME-004 - about teaser links to the about page', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Ahoj, jsem Lada' })).toBeVisible();
		const aboutLink = page.getByRole('link', { name: 'Můj příběh' });
		await expect(aboutLink).toBeVisible();
		await expect(aboutLink).toHaveAttribute('href', '/o-nas');
	});
});
