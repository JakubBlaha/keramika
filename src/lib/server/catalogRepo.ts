// Server-side catalog repository: the single trusted write path for categories,
// products, and instances (REQ-API-001). Both the admin UI and the seed client
// reach Firestore only through these functions, so cross-document invariants
// live in exactly one place:
//
//   - slug uniqueness for categories and products (REQ-API-009)
//   - deleting a category is blocked while it still has products (REQ-API-004,
//     REQ-ADMIN-016)
//   - deleting a product cascades to its instances (REQ-API-005)
//   - creating/deleting an instance keeps the product counts in sync
//     (REQ-API-006)
//   - the bulk import upserts by slug/id and is idempotent (REQ-API-010)
//
// Firestore layout (REQ-ADMIN-018):
//   categories/{slug}
//   products/{slug}
//   products/{slug}/instances/{instanceId}

import { getAdmin } from '$lib/server/firebaseAdmin';
import { ApiError } from '$lib/server/apiAuth';
import type {
	CatalogDocument,
	CategoryRecord,
	InstanceRecord,
	ProductRecord,
	ProductWithInstances
} from '$lib/catalog-model';

const CATEGORIES = 'categories';
const PRODUCTS = 'products';
const INSTANCES = 'instances';

function db() {
	return getAdmin().db;
}

// ---------------------------------------------------------------------------
// Reads (REQ-API-003)
// ---------------------------------------------------------------------------

export async function listCategories(): Promise<CategoryRecord[]> {
	const snap = await db().collection(CATEGORIES).get();
	return snap.docs.map((d) => d.data() as CategoryRecord);
}

export async function getCategory(slug: string): Promise<CategoryRecord | null> {
	const doc = await db().collection(CATEGORIES).doc(slug).get();
	return doc.exists ? (doc.data() as CategoryRecord) : null;
}

export async function listProducts(): Promise<ProductRecord[]> {
	const snap = await db().collection(PRODUCTS).get();
	return snap.docs.map((d) => d.data() as ProductRecord);
}

export async function getProduct(slug: string): Promise<ProductWithInstances | null> {
	const ref = db().collection(PRODUCTS).doc(slug);
	const doc = await ref.get();
	if (!doc.exists) return null;
	const instances = await listInstances(slug);
	return { ...(doc.data() as ProductRecord), instances };
}

export async function listInstances(productSlug: string): Promise<InstanceRecord[]> {
	const snap = await db().collection(PRODUCTS).doc(productSlug).collection(INSTANCES).get();
	return snap.docs.map((d) => d.data() as InstanceRecord);
}

// ---------------------------------------------------------------------------
// Categories (REQ-API-004)
// ---------------------------------------------------------------------------

export async function createCategory(input: CategoryRecord): Promise<CategoryRecord> {
	const ref = db().collection(CATEGORIES).doc(input.slug);
	const existing = await ref.get();
	if (existing.exists) {
		throw new ApiError(409, `Category slug already exists: ${input.slug}`);
	}
	await ref.set(input);
	return input;
}

export async function updateCategory(slug: string, input: CategoryRecord): Promise<CategoryRecord> {
	const ref = db().collection(CATEGORIES).doc(slug);
	const existing = await ref.get();
	if (!existing.exists) {
		throw new ApiError(404, `Category not found: ${slug}`);
	}
	// Slug is the document id; a rename would collide with another category.
	if (input.slug !== slug) {
		const target = await db().collection(CATEGORIES).doc(input.slug).get();
		if (target.exists) {
			throw new ApiError(409, `Category slug already exists: ${input.slug}`);
		}
	}
	await ref.set(input);
	return input;
}

export async function deleteCategory(slug: string): Promise<void> {
	const ref = db().collection(CATEGORIES).doc(slug);
	const existing = await ref.get();
	if (!existing.exists) {
		throw new ApiError(404, `Category not found: ${slug}`);
	}
	// Guard: a category with products cannot be deleted (REQ-ADMIN-016).
	const withProducts = await db()
		.collection(PRODUCTS)
		.where('categorySlug', '==', slug)
		.limit(1)
		.get();
	if (!withProducts.empty) {
		throw new ApiError(409, `Category has products and cannot be deleted: ${slug}`);
	}
	await ref.delete();
}

// ---------------------------------------------------------------------------
// Products (REQ-API-005)
// ---------------------------------------------------------------------------

async function assertCategoryExists(categorySlug: string): Promise<void> {
	const cat = await db().collection(CATEGORIES).doc(categorySlug).get();
	if (!cat.exists) {
		throw new ApiError(400, `Unknown category: ${categorySlug}`);
	}
}

export async function createProduct(input: ProductRecord): Promise<ProductRecord> {
	await assertCategoryExists(input.categorySlug);
	const ref = db().collection(PRODUCTS).doc(input.slug);
	const existing = await ref.get();
	if (existing.exists) {
		throw new ApiError(409, `Product slug already exists: ${input.slug}`);
	}
	await ref.set(withCounts(input, []));
	return input;
}

export async function updateProduct(slug: string, input: ProductRecord): Promise<ProductRecord> {
	await assertCategoryExists(input.categorySlug);
	const ref = db().collection(PRODUCTS).doc(slug);
	const existing = await ref.get();
	if (!existing.exists) {
		throw new ApiError(404, `Product not found: ${slug}`);
	}
	if (input.slug !== slug) {
		const target = await db().collection(PRODUCTS).doc(input.slug).get();
		if (target.exists) {
			throw new ApiError(409, `Product slug already exists: ${input.slug}`);
		}
	}
	// Preserve counts by recomputing from current instances.
	const instances = await listInstances(slug);
	await ref.set(withCounts(input, instances));
	return input;
}

export async function deleteProduct(slug: string): Promise<void> {
	const ref = db().collection(PRODUCTS).doc(slug);
	const existing = await ref.get();
	if (!existing.exists) {
		throw new ApiError(404, `Product not found: ${slug}`);
	}
	// Cascade delete the product's instances (REQ-API-005).
	const instances = await ref.collection(INSTANCES).get();
	const batch = db().batch();
	instances.docs.forEach((d) => batch.delete(d.ref));
	batch.delete(ref);
	await batch.commit();
}

// ---------------------------------------------------------------------------
// Instances (REQ-API-006)
// ---------------------------------------------------------------------------

export async function createInstance(
	productSlug: string,
	input: InstanceRecord
): Promise<InstanceRecord> {
	const productRef = db().collection(PRODUCTS).doc(productSlug);
	if (!(await productRef.get()).exists) {
		throw new ApiError(404, `Product not found: ${productSlug}`);
	}
	const ref = productRef.collection(INSTANCES).doc(input.id);
	if ((await ref.get()).exists) {
		throw new ApiError(409, `Instance id already exists: ${input.id}`);
	}
	await ref.set(input);
	await recomputeCounts(productSlug);
	return input;
}

export async function updateInstance(
	productSlug: string,
	instanceId: string,
	input: InstanceRecord
): Promise<InstanceRecord> {
	const ref = db().collection(PRODUCTS).doc(productSlug).collection(INSTANCES).doc(instanceId);
	if (!(await ref.get()).exists) {
		throw new ApiError(404, `Instance not found: ${instanceId}`);
	}
	await ref.set(input);
	await recomputeCounts(productSlug);
	return input;
}

export async function deleteInstance(productSlug: string, instanceId: string): Promise<void> {
	const ref = db().collection(PRODUCTS).doc(productSlug).collection(INSTANCES).doc(instanceId);
	if (!(await ref.get()).exists) {
		throw new ApiError(404, `Instance not found: ${instanceId}`);
	}
	await ref.delete();
	await recomputeCounts(productSlug);
}

// ---------------------------------------------------------------------------
// Counts kept in sync on the product document (REQ-API-006, REQ-CATALOG-004)
// ---------------------------------------------------------------------------

function withCounts(product: ProductRecord, instances: InstanceRecord[]) {
	return {
		...product,
		availableCount: instances.filter((i) => i.available).length,
		totalCount: instances.length
	};
}

async function recomputeCounts(productSlug: string): Promise<void> {
	const instances = await listInstances(productSlug);
	await db()
		.collection(PRODUCTS)
		.doc(productSlug)
		.set(
			{
				availableCount: instances.filter((i) => i.available).length,
				totalCount: instances.length
			},
			{ merge: true }
		);
}

// ---------------------------------------------------------------------------
// Bulk import / seed (REQ-API-010, REQ-API-011)
//
// Idempotent upsert of a whole catalog document by slug/id. Re-running the same
// import yields the same state and no duplicates. Reports how many entities
// were created versus updated.
// ---------------------------------------------------------------------------

export type ImportReport = {
	categories: { created: number; updated: number };
	products: { created: number; updated: number };
	instances: { created: number; updated: number };
};

export async function bulkImport(doc: CatalogDocument): Promise<ImportReport> {
	const report: ImportReport = {
		categories: { created: 0, updated: 0 },
		products: { created: 0, updated: 0 },
		instances: { created: 0, updated: 0 }
	};

	for (const category of doc.categories) {
		const ref = db().collection(CATEGORIES).doc(category.slug);
		const existed = (await ref.get()).exists;
		await ref.set(category);
		if (existed) report.categories.updated++;
		else report.categories.created++;
	}

	for (const product of doc.products) {
		const { instances, ...record } = product;
		const ref = db().collection(PRODUCTS).doc(record.slug);
		const existed = (await ref.get()).exists;
		await ref.set(withCounts(record as ProductRecord, instances));
		if (existed) report.products.updated++;
		else report.products.created++;

		for (const instance of instances) {
			const iref = ref.collection(INSTANCES).doc(instance.id);
			const iexisted = (await iref.get()).exists;
			await iref.set(instance);
			if (iexisted) report.instances.updated++;
			else report.instances.created++;
		}
	}

	return report;
}

// ---------------------------------------------------------------------------
// Instance image upload to Firebase Storage (REQ-API-007, REQ-ADMIN-019)
//
// Files are stored under products/<slug>/<instanceId>/<filename> and made
// publicly readable so the public product detail page can load them. Returns
// the ordered public URLs; the caller records them on the instance.
// ---------------------------------------------------------------------------

export type UploadFile = {
	filename: string;
	contentType: string;
	data: Buffer;
};

export async function uploadInstanceImages(
	productSlug: string,
	instanceId: string,
	files: UploadFile[]
): Promise<string[]> {
	const bucket = getAdmin().storage.bucket();
	const urls: string[] = [];

	for (const file of files) {
		const path = `products/${productSlug}/${instanceId}/${file.filename}`;
		const blob = bucket.file(path);
		await blob.save(file.data, {
			contentType: file.contentType,
			resumable: false
		});
		await blob.makePublic();
		urls.push(`https://storage.googleapis.com/${bucket.name}/${encodeURI(path)}`);
	}

	return urls;
}
