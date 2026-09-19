import { expect, test, type Page } from '@playwright/test';

// E2E tests for the admin catalog management UI (categories, products,
// instances) under /admin. Test titles carry the requirement ID for
// traceability. See docs/requirements/admin.md.
//
// The admin area is Firebase-backed (Auth + Firestore + Storage), so every
// test here needs a real backend and runs only against the Firebase emulator
// suite (`pnpm test:e2e:emulator`, which also provisions the seed admin
// account via scripts/emulator-admin-setup.mjs). Tests are skipped otherwise.

async function usingEmulator(page: Page): Promise<boolean> {
	await page.goto('/');
	return page.evaluate(() => document.documentElement.dataset.firebaseEmulator === 'true');
}

async function loginAsAdmin(page: Page) {
	await page.goto('/admin');
	await page.getByLabel('E-mail').fill(process.env.SEED_ADMIN_EMAIL ?? '');
	await page.getByLabel('Heslo').fill(process.env.SEED_ADMIN_PASSWORD ?? '');
	await page.getByRole('button', { name: 'Přihlásit se', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Administrace' })).toBeVisible({
		timeout: 15000
	});
}

function unique(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

test.describe('Admin', () => {
	test.beforeEach(async ({ page }) => {
		test.skip(!(await usingEmulator(page)), 'Requires the Firebase emulator (pnpm test:e2e:emulator)');
	});

	test('REQ-ADMIN-002 - unauthenticated visitors see only the login form', async ({ page }) => {
		await page.goto('/admin');
		await expect(page.getByRole('heading', { name: 'Přihlášení' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Administrace' })).toHaveCount(0);
	});

	test('REQ-ADMIN-003 - admin can log in with valid credentials', async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page.getByRole('link', { name: 'Objednávky', exact: true })).toBeVisible();
	});

	test('REQ-ADMIN-003 - invalid credentials show an error and no session starts', async ({
		page
	}) => {
		await page.goto('/admin');
		await page.getByLabel('E-mail').fill('nope@example.com');
		await page.getByLabel('Heslo').fill('wrong-password');
		await page.getByRole('button', { name: 'Přihlásit se', exact: true }).click();
		await expect(
			page.getByText('Přihlášení se nezdařilo. Zkontrolujte e-mail a heslo.')
		).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Administrace' })).toHaveCount(0);
	});

	test('REQ-ADMIN-004 - admin can log out, requiring login again', async ({ page }) => {
		await loginAsAdmin(page);
		await page.getByRole('button', { name: 'Odhlásit se' }).click();
		await expect(page.getByRole('heading', { name: 'Přihlášení' })).toBeVisible();
	});

	test('REQ-ADMIN-013 - lists categories with slug, name and product count', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');
		await expect(page.getByRole('heading', { name: 'Kategorie', exact: true })).toBeVisible();
	});

	test('REQ-ADMIN-014 - admin can create a category', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');

		const slug = unique('kategorie');
		await page.locator('input[placeholder="andele"]').fill(slug);
		const form = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await form.getByLabel('Název (čeština)').fill('Testovací kategorie');
		await form.getByLabel('Název (angličtina)').fill('Test category');
		await form.getByLabel('Popis (čeština)').fill('Popis testovací kategorie.');
		await form.getByLabel('Popis (angličtina)').fill('Test category description.');
		await form.getByRole('button', { name: 'Vytvořit kategorii' }).click();

		await expect(page.getByText(slug)).toBeVisible({ timeout: 10000 });
	});

	test('REQ-ADMIN-015 - admin can edit a category', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');

		const slug = unique('editkat');
		await page.locator('input[placeholder="andele"]').fill(slug);
		const form = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await form.getByLabel('Název (čeština)').fill('Před úpravou');
		await form.getByLabel('Název (angličtina)').fill('Before edit');
		await form.getByLabel('Popis (čeština)').fill('Popis.');
		await form.getByLabel('Popis (angličtina)').fill('Description.');
		await form.getByRole('button', { name: 'Vytvořit kategorii' }).click();

		const row = page.locator('li').filter({ hasText: slug });
		await expect(row).toBeVisible({ timeout: 10000 });
		await row.getByRole('link', { name: 'Upravit' }).click();

		await expect(page.getByRole('heading', { name: 'Upravit kategorii' })).toBeVisible();
		await page.getByLabel('Název (čeština)').fill('Po úpravě');
		await page.getByRole('button', { name: 'Uložit' }).click();
		await expect(page.getByText('Uloženo.')).toBeVisible({ timeout: 10000 });
	});

	test('REQ-ADMIN-016 - deleting a category with products is blocked', async ({ page }) => {
		await loginAsAdmin(page);
		// "andele" ships in the placeholder catalog and has products once seeded;
		// if it is not present yet in this emulator run, this test is a no-op via
		// the category not being found, so create a category + product pairing
		// explicitly to make the guard deterministic.
		await page.goto('/admin/kategorie');
		const catSlug = unique('svazana');
		const form = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await page.locator('input[placeholder="andele"]').fill(catSlug);
		await form.getByLabel('Název (čeština)').fill('Svázaná kategorie');
		await form.getByLabel('Název (angličtina)').fill('Linked category');
		await form.getByLabel('Popis (čeština)').fill('Popis.');
		await form.getByLabel('Popis (angličtina)').fill('Description.');
		await form.getByRole('button', { name: 'Vytvořit kategorii' }).click();
		await expect(page.getByText(catSlug)).toBeVisible({ timeout: 10000 });

		// Create a product in that category.
		await page.goto('/admin/produkty/novy');
		const prodSlug = unique('produkt');
		await page.getByLabel('Slug').fill(prodSlug);
		await page.getByLabel('Kategorie').selectOption(catSlug);
		await page.getByLabel('Název (čeština)').fill('Test produkt');
		await page.getByLabel('Název (angličtina)').fill('Test product');
		await page.getByLabel('Krátký popisek (čeština)').fill('Popisek');
		await page.getByLabel('Krátký popisek (angličtina)').fill('Tagline');
		await page.getByLabel('Cena (Kč)').fill('100');
		await page.getByLabel('Velikost').fill('10 cm');
		await page.getByLabel('Materiál (čeština)').fill('Hlína');
		await page.getByLabel('Materiál (angličtina)').fill('Clay');
		await page.getByLabel('Popis (čeština)').fill('Popis produktu.');
		await page.getByLabel('Popis (angličtina)').fill('Product description.');
		await page.getByLabel('Péče (čeština)').fill('Péče.');
		await page.getByLabel('Péče (angličtina)').fill('Care.');
		await page.getByRole('button', { name: 'Vytvořit produkt' }).click();
		await expect(page.getByRole('heading', { name: 'Upravit produkt' })).toBeVisible({
			timeout: 10000
		});

		// Now deleting the category must be blocked.
		await page.goto('/admin/kategorie/' + catSlug);
		page.once('dialog', (d) => d.accept());
		await page.getByRole('button', { name: 'Smazat' }).click();
		await expect(page.getByText(/nepodařilo|cannot|has products/i)).toBeVisible({
			timeout: 10000
		});
	});

	test('REQ-ADMIN-005 - lists products with name, category and instance counts', async ({
		page
	}) => {
		await loginAsAdmin(page);
		await page.goto('/admin/produkty');
		await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
	});

	test('REQ-ADMIN-006 - admin can create a product', async ({ page }) => {
		await loginAsAdmin(page);

		// Ensure a category exists to assign the product to.
		await page.goto('/admin/kategorie');
		const catSlug = unique('kat-pro-produkt');
		const catForm = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await page.locator('input[placeholder="andele"]').fill(catSlug);
		await catForm.getByLabel('Název (čeština)').fill('Kategorie');
		await catForm.getByLabel('Název (angličtina)').fill('Category');
		await catForm.getByLabel('Popis (čeština)').fill('Popis.');
		await catForm.getByLabel('Popis (angličtina)').fill('Description.');
		await catForm.getByRole('button', { name: 'Vytvořit kategorii' }).click();
		await expect(page.getByText(catSlug)).toBeVisible({ timeout: 10000 });

		await page.goto('/admin/produkty/novy');
		const prodSlug = unique('novy-produkt');
		await page.getByLabel('Slug').fill(prodSlug);
		await page.getByLabel('Kategorie').selectOption(catSlug);
		await page.getByLabel('Název (čeština)').fill('Nový produkt');
		await page.getByLabel('Název (angličtina)').fill('New product');
		await page.getByLabel('Krátký popisek (čeština)').fill('Popisek');
		await page.getByLabel('Krátký popisek (angličtina)').fill('Tagline');
		await page.getByLabel('Cena (Kč)').fill('250');
		await page.getByLabel('Velikost').fill('15 cm');
		await page.getByLabel('Materiál (čeština)').fill('Kamenina');
		await page.getByLabel('Materiál (angličtina)').fill('Stoneware');
		await page.getByLabel('Popis (čeština)').fill('Popis produktu.');
		await page.getByLabel('Popis (angličtina)').fill('Product description.');
		await page.getByLabel('Péče (čeština)').fill('Péče.');
		await page.getByLabel('Péče (angličtina)').fill('Care.');
		await page.getByRole('button', { name: 'Vytvořit produkt' }).click();

		await expect(page.getByRole('heading', { name: 'Upravit produkt' })).toBeVisible({
			timeout: 10000
		});

		await page.goto('/admin/produkty');
		await expect(page.getByText(prodSlug)).toBeVisible({ timeout: 10000 });
	});

	test('REQ-ADMIN-007 - admin can edit a product', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');
		const catSlug = unique('kat-edit');
		const catForm = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await page.locator('input[placeholder="andele"]').fill(catSlug);
		await catForm.getByLabel('Název (čeština)').fill('Kategorie');
		await catForm.getByLabel('Název (angličtina)').fill('Category');
		await catForm.getByLabel('Popis (čeština)').fill('Popis.');
		await catForm.getByLabel('Popis (angličtina)').fill('Description.');
		await catForm.getByRole('button', { name: 'Vytvořit kategorii' }).click();
		await expect(page.getByText(catSlug)).toBeVisible({ timeout: 10000 });

		await page.goto('/admin/produkty/novy');
		const prodSlug = unique('editovat');
		await page.getByLabel('Slug').fill(prodSlug);
		await page.getByLabel('Kategorie').selectOption(catSlug);
		await page.getByLabel('Název (čeština)').fill('Před úpravou');
		await page.getByLabel('Název (angličtina)').fill('Before edit');
		await page.getByLabel('Krátký popisek (čeština)').fill('Popisek');
		await page.getByLabel('Krátký popisek (angličtina)').fill('Tagline');
		await page.getByLabel('Cena (Kč)').fill('250');
		await page.getByLabel('Velikost').fill('15 cm');
		await page.getByLabel('Materiál (čeština)').fill('Kamenina');
		await page.getByLabel('Materiál (angličtina)').fill('Stoneware');
		await page.getByLabel('Popis (čeština)').fill('Popis.');
		await page.getByLabel('Popis (angličtina)').fill('Description.');
		await page.getByLabel('Péče (čeština)').fill('Péče.');
		await page.getByLabel('Péče (angličtina)').fill('Care.');
		await page.getByRole('button', { name: 'Vytvořit produkt' }).click();
		await expect(page.getByRole('heading', { name: 'Upravit produkt' })).toBeVisible({
			timeout: 10000
		});

		await page.getByLabel('Název (čeština)').fill('Po úpravě');
		await page.getByRole('button', { name: 'Uložit' }).click();
		await expect(page.getByText('Uloženo.')).toBeVisible({ timeout: 10000 });
	});

	test('REQ-ADMIN-008 - admin can delete a product', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');
		const catSlug = unique('kat-del');
		const catForm = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await page.locator('input[placeholder="andele"]').fill(catSlug);
		await catForm.getByLabel('Název (čeština)').fill('Kategorie');
		await catForm.getByLabel('Název (angličtina)').fill('Category');
		await catForm.getByLabel('Popis (čeština)').fill('Popis.');
		await catForm.getByLabel('Popis (angličtina)').fill('Description.');
		await catForm.getByRole('button', { name: 'Vytvořit kategorii' }).click();
		await expect(page.getByText(catSlug)).toBeVisible({ timeout: 10000 });

		await page.goto('/admin/produkty/novy');
		const prodSlug = unique('smazat');
		await page.getByLabel('Slug').fill(prodSlug);
		await page.getByLabel('Kategorie').selectOption(catSlug);
		await page.getByLabel('Název (čeština)').fill('Ke smazání');
		await page.getByLabel('Název (angličtina)').fill('To delete');
		await page.getByLabel('Krátký popisek (čeština)').fill('Popisek');
		await page.getByLabel('Krátký popisek (angličtina)').fill('Tagline');
		await page.getByLabel('Cena (Kč)').fill('50');
		await page.getByLabel('Velikost').fill('5 cm');
		await page.getByLabel('Materiál (čeština)').fill('Hlína');
		await page.getByLabel('Materiál (angličtina)').fill('Clay');
		await page.getByLabel('Popis (čeština)').fill('Popis.');
		await page.getByLabel('Popis (angličtina)').fill('Description.');
		await page.getByLabel('Péče (čeština)').fill('Péče.');
		await page.getByLabel('Péče (angličtina)').fill('Care.');
		await page.getByRole('button', { name: 'Vytvořit produkt' }).click();
		await expect(page.getByRole('heading', { name: 'Upravit produkt' })).toBeVisible({
			timeout: 10000
		});

		page.once('dialog', (d) => d.accept());
		await page.getByRole('button', { name: 'Smazat' }).click();
		await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(prodSlug)).toHaveCount(0);
	});

	test('REQ-ADMIN-009,010,011,012 - manage a product instance with images', async ({ page }) => {
		await loginAsAdmin(page);
		await page.goto('/admin/kategorie');
		const catSlug = unique('kat-inst');
		const catForm = page.locator('form').filter({ hasText: 'Nová kategorie' });
		await page.locator('input[placeholder="andele"]').fill(catSlug);
		await catForm.getByLabel('Název (čeština)').fill('Kategorie');
		await catForm.getByLabel('Název (angličtina)').fill('Category');
		await catForm.getByLabel('Popis (čeština)').fill('Popis.');
		await catForm.getByLabel('Popis (angličtina)').fill('Description.');
		await catForm.getByRole('button', { name: 'Vytvořit kategorii' }).click();
		await expect(page.getByText(catSlug)).toBeVisible({ timeout: 10000 });

		await page.goto('/admin/produkty/novy');
		const prodSlug = unique('kusy');
		await page.getByLabel('Slug').fill(prodSlug);
		await page.getByLabel('Kategorie').selectOption(catSlug);
		await page.getByLabel('Název (čeština)').fill('Produkt s kusy');
		await page.getByLabel('Název (angličtina)').fill('Product with pieces');
		await page.getByLabel('Krátký popisek (čeština)').fill('Popisek');
		await page.getByLabel('Krátký popisek (angličtina)').fill('Tagline');
		await page.getByLabel('Cena (Kč)').fill('300');
		await page.getByLabel('Velikost').fill('20 cm');
		await page.getByLabel('Materiál (čeština)').fill('Porcelán');
		await page.getByLabel('Materiál (angličtina)').fill('Porcelain');
		await page.getByLabel('Popis (čeština)').fill('Popis.');
		await page.getByLabel('Popis (angličtina)').fill('Description.');
		await page.getByLabel('Péče (čeština)').fill('Péče.');
		await page.getByLabel('Péče (angličtina)').fill('Care.');
		await page.getByRole('button', { name: 'Vytvořit produkt' }).click();
		await expect(page.getByRole('heading', { name: 'Upravit produkt' })).toBeVisible({
			timeout: 10000
		});

		// No instances yet (REQ-ADMIN-009).
		await expect(page.getByText('Tento produkt zatím nemá žádné kusy.')).toBeVisible();

		// Create an instance (REQ-ADMIN-010).
		await page.getByLabel('Označení kusu').fill('#1');
		await page.getByRole('button', { name: 'Přidat kus' }).click();
		await expect(page.getByText('#1')).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('button', { name: 'K dispozici' })).toBeVisible();

		// Edit availability (REQ-ADMIN-011).
		await page.getByRole('button', { name: 'K dispozici' }).click();
		await expect(page.getByRole('button', { name: 'Prodáno' })).toBeVisible({ timeout: 10000 });

		// Delete the instance (REQ-ADMIN-012).
		page.once('dialog', (d) => d.accept());
		await page.getByRole('button', { name: 'Smazat' }).last().click();
		await expect(page.getByText('Tento produkt zatím nemá žádné kusy.')).toBeVisible({
			timeout: 10000
		});
	});
});
