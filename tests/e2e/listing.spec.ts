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
	test('REQ-LISTING-001 - categories landing shows category cards', async ({ page }) => {
		await page.goto('/produkty');
		// Scope to the main content (the footer also links to categories).
		const angels = page.locator('main a[href="/produkty/andele"]');
		await expect(angels).toBeVisible();
		// Card shows a cover image, localized name, description and product count.
		await expect(angels.locator('img')).toBeVisible();
		await expect(angels.getByRole('heading', { name: 'Andělé' })).toBeVisible();
		await expect(angels.getByText('1 produktů')).toBeVisible();
	});

	test('REQ-LISTING-002 - category listing links to products and has a back link', async ({
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

	test('REQ-LISTING-003 - product card shows image, name, meta and price', async ({ page }) => {
		await page.goto('/produkty/andele');
		const card = page.locator('a[href="/produkt/andel"]');
		await expect(card.locator('img')).toBeVisible();
		await expect(card.getByRole('heading', { name: 'Anděl' })).toBeVisible();
		await expect(card.getByText('Kamenina · ruční práce')).toBeVisible();
		await expect(card.getByText('390 Kč')).toBeVisible();
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

	test('REQ-LISTING-008 - hovering a card previews up to four pieces', async ({ page }) => {
		// Dubánek has 5 pieces -> 4 in the preview.
		await gotoHydrated(page, '/produkty/postavicky');
		const dubanek = page.locator('a[href="/produkt/dubanek"]');
		await dubanek.hover();
		const preview = dubanek.getByTestId('piece-preview');
		await expect(preview).toHaveCSS('visibility', 'visible');
		await expect(preview.locator('> div')).toHaveCount(4);

		// Leaving the card zooms back in and then hides the preview (no fade).
		await page.mouse.move(0, 0);
		await expect(preview).toHaveCSS('visibility', 'hidden');
		await expect(preview).toHaveCSS('opacity', '1');

		// Ptáček has a single piece -> no preview.
		await gotoHydrated(page, '/produkty/zviratka');
		const bird = page.locator('a[href="/produkt/ptacek"]');
		await bird.hover();
		await expect(bird.getByTestId('piece-preview')).toHaveCount(0);
	});
});
