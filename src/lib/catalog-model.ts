// Catalog data model shared by the write API, the seed client, and (later) the
// public site reads. This is the Firestore-facing shape of the catalog.
//
// The placeholder module src/lib/catalog.ts stores localized copy as Paraglide
// message functions (compile-time, code). Firestore cannot store functions, so
// persisted copy is stored as a Localized map { cs, en }. Language-neutral data
// (slug, price, size, image URLs, availability) is stored as-is.
//
// Collections (see REQ-ADMIN-018):
//   categories/{slug}
//   products/{slug}                       (product carries its categorySlug)
//   products/{slug}/instances/{instanceId}
//
// Images live in Firebase Storage (see REQ-ADMIN-019) and instances hold the
// ordered public URLs.

// A piece of user-facing copy in both supported locales.
export type Localized = {
	cs: string;
	en: string;
};

export type CategoryRecord = {
	slug: string;
	name: Localized;
	description: Localized;
};

export type ProductRecord = {
	slug: string;
	// Slug of the category this product belongs to.
	categorySlug: string;
	name: Localized;
	// Short one-line meta/eyebrow (e.g. "Figurine").
	meta: Localized;
	description: Localized;
	care: Localized;
	// Base price in CZK, language-neutral string (e.g. "390").
	price: string;
	// Human-readable dimension/volume (e.g. "12 cm").
	size: string;
};

export type InstanceRecord = {
	// Unique id of the single physical piece (e.g. "angel-01").
	id: string;
	// Short label shown to the buyer (e.g. "#1").
	label: string;
	// Ordered public image URLs (Firebase Storage download URLs or paths).
	images: string[];
	// Per-instance price override in CZK; falls back to the product price.
	price?: string;
	// False once this single piece has been sold.
	available: boolean;
};

// A product bundled with its instances, used by the bulk import payload and by
// full product reads.
export type ProductWithInstances = ProductRecord & {
	instances: InstanceRecord[];
};

// The full catalog document accepted by the bulk import endpoint (REQ-API-010).
export type CatalogDocument = {
	categories: CategoryRecord[];
	products: ProductWithInstances[];
};

// ---------------------------------------------------------------------------
// Validation
//
// The API validates payloads and returns structured errors without partial
// writes (REQ-API-008). These helpers return a list of human-readable problems;
// an empty list means the value is valid.
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ValidationError = { field: string; message: string };

function isNonEmptyString(v: unknown): v is string {
	return typeof v === 'string' && v.trim().length > 0;
}

function checkLocalized(field: string, v: unknown, errors: ValidationError[]): void {
	if (v == null || typeof v !== 'object') {
		errors.push({ field, message: 'must be a { cs, en } object' });
		return;
	}
	const l = v as Record<string, unknown>;
	if (!isNonEmptyString(l.cs)) errors.push({ field: `${field}.cs`, message: 'is required' });
	if (!isNonEmptyString(l.en)) errors.push({ field: `${field}.en`, message: 'is required' });
}

export function validateCategory(input: unknown): ValidationError[] {
	const errors: ValidationError[] = [];
	if (input == null || typeof input !== 'object') {
		return [{ field: '(root)', message: 'category must be an object' }];
	}
	const c = input as Record<string, unknown>;
	if (!isNonEmptyString(c.slug) || !SLUG_RE.test(c.slug)) {
		errors.push({ field: 'slug', message: 'must be a lowercase kebab-case slug' });
	}
	checkLocalized('name', c.name, errors);
	checkLocalized('description', c.description, errors);
	return errors;
}

export function validateProduct(input: unknown): ValidationError[] {
	const errors: ValidationError[] = [];
	if (input == null || typeof input !== 'object') {
		return [{ field: '(root)', message: 'product must be an object' }];
	}
	const p = input as Record<string, unknown>;
	if (!isNonEmptyString(p.slug) || !SLUG_RE.test(p.slug)) {
		errors.push({ field: 'slug', message: 'must be a lowercase kebab-case slug' });
	}
	if (!isNonEmptyString(p.categorySlug) || !SLUG_RE.test(p.categorySlug)) {
		errors.push({ field: 'categorySlug', message: 'must be a lowercase kebab-case slug' });
	}
	if (!isNonEmptyString(p.price)) errors.push({ field: 'price', message: 'is required' });
	if (!isNonEmptyString(p.size)) errors.push({ field: 'size', message: 'is required' });
	checkLocalized('name', p.name, errors);
	checkLocalized('meta', p.meta, errors);
	checkLocalized('description', p.description, errors);
	checkLocalized('care', p.care, errors);
	return errors;
}

export function validateInstance(input: unknown): ValidationError[] {
	const errors: ValidationError[] = [];
	if (input == null || typeof input !== 'object') {
		return [{ field: '(root)', message: 'instance must be an object' }];
	}
	const i = input as Record<string, unknown>;
	if (!isNonEmptyString(i.id)) errors.push({ field: 'id', message: 'is required' });
	if (!isNonEmptyString(i.label)) errors.push({ field: 'label', message: 'is required' });
	if (!Array.isArray(i.images)) {
		errors.push({ field: 'images', message: 'must be an array of URLs' });
	} else if (!i.images.every((x) => isNonEmptyString(x))) {
		errors.push({ field: 'images', message: 'every image must be a non-empty string' });
	}
	if (typeof i.available !== 'boolean') {
		errors.push({ field: 'available', message: 'must be a boolean' });
	}
	if (i.price != null && !isNonEmptyString(i.price)) {
		errors.push({ field: 'price', message: 'must be a non-empty string when present' });
	}
	return errors;
}
