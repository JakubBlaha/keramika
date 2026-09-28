// Reads the catalog for the public site from Firestore (REQ-CATALOG-010).
//
// The public pages have no built-in products: every page that shows catalog
// data calls loadCatalog() from its server load, so what the admin edits is
// what visitors see on the next request. Three queries per call (categories,
// products, and every instance via a collection-group query), independent of
// the catalog size.
//
// Copy is localized to the request's locale, and categories and products are
// sorted by that localized name (the model has no explicit display order);
// instances keep their id order.

import type { Localized, CategoryRecord, InstanceRecord, ProductRecord } from '$lib/catalog-model';
import type { Category, Product } from '$lib/catalog';
import { getLocale } from '$lib/paraglide/runtime';
import { getAdmin } from '$lib/server/firebaseAdmin';

export async function loadCatalog(): Promise<Category[]> {
	const { db } = getAdmin();
	const [categorySnap, productSnap, instanceSnap] = await Promise.all([
		db.collection('categories').get(),
		db.collection('products').get(),
		db.collectionGroup('instances').get()
	]);

	const locale = getLocale();
	const text = (l: Localized | undefined) => l?.[locale] || l?.cs || '';
	const collator = new Intl.Collator(locale);
	const byName = (a: { name: string }, b: { name: string }) => collator.compare(a.name, b.name);

	// Instances grouped by their product (the parent of the subcollection).
	const instancesByProduct = new Map<string, InstanceRecord[]>();
	for (const doc of instanceSnap.docs) {
		const productSlug = doc.ref.parent.parent?.id;
		if (!productSlug) continue;
		const list = instancesByProduct.get(productSlug) ?? [];
		list.push(doc.data() as InstanceRecord);
		instancesByProduct.set(productSlug, list);
	}

	const products = productSnap.docs.map((doc): Product => {
		const p = doc.data() as ProductRecord;
		return {
			slug: p.slug,
			categorySlug: p.categorySlug,
			name: text(p.name),
			meta: text(p.meta),
			description: text(p.description),
			care: text(p.care),
			price: p.price,
			size: p.size,
			instances: (instancesByProduct.get(p.slug) ?? [])
				.map((i) => ({
					id: i.id,
					label: i.label,
					images: i.images ?? [],
					available: i.available,
					...(i.price ? { price: i.price } : {})
				}))
				.sort((a, b) => a.id.localeCompare(b.id))
		};
	});

	return categorySnap.docs
		.map((doc): Category => {
			const c = doc.data() as CategoryRecord;
			return {
				slug: c.slug,
				name: text(c.name),
				description: text(c.description),
				products: products.filter((p) => p.categorySlug === c.slug).sort(byName)
			};
		})
		.sort(byName);
}
