import { expect, test, type Page } from '@playwright/test';

// E2E tests for the listing pages: categories landing (/produkty) and the
// per-category listing (/produkty/[category]). Test titles carry the
// requirement ID for traceability. See docs/requirements/listing.md.

// Wait until SvelteKit has hydrated (the root layout sets this attribute in an
// $effect); before that, hover handlers are not attached yet.
async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page.waitForFunction(() => document.documentElement.dataset.firebaseEmulator !== undefined);
}

test.describe('Listing', () => {
	test('REQ-LISTING-002, REQ-CATALOG-007 - category listing links to products and has a back link', async ({
		page
	}) => {
		await page.goto('/produkty/zviratka');
		// Back link to the categories landing.
		const back = page.getByRole('link', { name: 'Zpět na kategorie' });
		await expect(back).toBeVisible();
		await expect(back).toHaveAttribute('href', '/produkty');

		// Each product card links to a detail page (animals has 3 products).
		const productLinks = page.locator('a[href^="/produkt/"]');
		await expect(productLinks).toHaveCount(3);
		await expect(page.locator('a[href="/produkt/kocicka"]')).toBeVisible();
	});

	test('REQ-LISTING-004 - last-piece badge and no badge for multi-stock', async ({ page }) => {
		await page.goto('/produkty/zviratka');
		// Bird (ptacek) has exactly 1 available piece -> last-piece badge.
		const bird = page.locator('a[href="/produkt/ptacek"]');
		await expect(bird.getByText('Poslední kus')).toBeVisible();

		// Cat (kocicka) has 2 available pieces -> no badge.
		const cat = page.locator('a[href="/produkt/kocicka"]');
		await expect(cat.getByText('Poslední kus')).toHaveCount(0);
		await expect(cat.getByText('Vyprodáno')).toHaveCount(0);
	});

	test('REQ-LISTING-009 - category switcher jumps between categories', async ({ page }) => {
		await gotoHydrated(page, '/produkty/zviratka');
		const switcher = page.getByRole('navigation', { name: 'Kategorie' });

		// Every category is listed, and the current one is marked.
		for (const slug of ['andele', 'zviratka', 'postavicky', 'dekorace']) {
			await expect(switcher.locator(`a[href="/produkty/${slug}"]`)).toHaveCount(1);
		}
		await expect(switcher.locator('a[aria-current="page"]')).toHaveAttribute(
			'href',
			'/produkty/zviratka'
		);

		// Switching shows the other category without going back to /produkty.
		await switcher.locator('a[href="/produkty/postavicky"]').click();
		await expect(page).toHaveURL(/\/produkty\/postavicky$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Postavičky' })).toBeVisible();
		await expect(switcher.locator('a[aria-current="page"]')).toHaveAttribute(
			'href',
			'/produkty/postavicky'
		);
	});
});
