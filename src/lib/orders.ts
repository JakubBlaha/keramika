// Order (reservation) data access for the admin area.
//
// Orders are placed through checkout and stored in Cloud Firestore (see
// REQ-ADMIN-018, REQ-CHECKOUT-010). This module is the single place the admin
// UI reads and writes orders. Because Firebase is browser-only in this project
// (see src/lib/firebase.ts), every function here must run in the browser.
//
// An order is a reservation, not a paid sale (REQ-CHECKOUT-009): payment
// happens in store on pickup. Cancelling an order releases its reserved
// instances so they become available again (REQ-ADMIN-022).

import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	type Firestore
} from 'firebase/firestore';
import { getFirebase } from '$lib/firebase';

// Lifecycle status of an order.
// - new: just placed, awaiting handling by the shop.

// - resolved: the buyer picked up and paid; the reservation is done.
// - cancelled: the reservation was cancelled; instances are released.
export type OrderStatus = 'new' | 'resolved' | 'cancelled';

// A single reserved piece captured at order time. Prices/titles are stored on
// the order so the admin view is stable even if the catalog later changes.
export type OrderItem = {
	// Instance id of the unique physical piece (e.g. "angel-01").
	instanceId: string;
	// Product title as shown to the buyer at order time.
	title: string;
	// Instance label (e.g. "#1").
	label: string;
	// Unit price in CZK at order time.
	price: string;
};

// Buyer contact details collected at checkout (REQ-CHECKOUT-002). No shipping
// address: fulfillment is in-store pickup only (REQ-CHECKOUT-007).
export type OrderContact = {
	name: string;
	email: string;
	phone: string;
};

export type Order = {
	// Firestore document id.
	id: string;
	// Short human reference shown in the UI (falls back to the id).
	reference: string;
	// When the order was placed, as an ISO string (or empty if unknown).
	createdAt: string;
	status: OrderStatus;
	contact: OrderContact;
	items: OrderItem[];
	// Order total in CZK.
	total: string;
};

const ORDERS_COLLECTION = 'orders';

// Coerce a Firestore document into an Order, tolerating partial/legacy data so
// the admin UI never crashes on an unexpected shape.
function toOrder(id: string, data: Record<string, unknown>): Order {
	const contact = (data.contact ?? {}) as Partial<OrderContact>;
	const rawItems = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
	const items: OrderItem[] = rawItems.map((it) => ({
		instanceId: String(it.instanceId ?? ''),
		title: String(it.title ?? ''),
		label: String(it.label ?? ''),
		price: String(it.price ?? '')
	}));

	const status = data.status;
	const normalizedStatus: OrderStatus =
		status === 'resolved' || status === 'cancelled' ? status : 'new';

	// createdAt may be a Firestore Timestamp, a millisecond number, or a string.
	let createdAt = '';
	const rawCreated = data.createdAt as { toDate?: () => Date } | number | string | undefined;
	if (rawCreated && typeof rawCreated === 'object' && typeof rawCreated.toDate === 'function') {
		createdAt = rawCreated.toDate().toISOString();
	} else if (typeof rawCreated === 'number') {
		createdAt = new Date(rawCreated).toISOString();
	} else if (typeof rawCreated === 'string') {
		createdAt = rawCreated;
	}

	// Total falls back to the sum of item prices when not stored explicitly.
	const total =
		data.total != null
			? String(data.total)
			: String(items.reduce((sum, it) => sum + (Number(it.price) || 0), 0));

	return {
		id,
		reference: String(data.reference ?? id),
		createdAt,
		status: normalizedStatus,
		contact: {
			name: String(contact.name ?? ''),
			email: String(contact.email ?? ''),
			phone: String(contact.phone ?? '')
		},
		items,
		total
	};
}

function db(): Firestore {
	return getFirebase().db;
}

// All orders, newest first (REQ-ADMIN-020).
export async function listOrders(): Promise<Order[]> {
	const q = query(collection(db(), ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
	const snap = await getDocs(q);
	return snap.docs.map((d) => toOrder(d.id, d.data() as Record<string, unknown>));
}

// A single order by id, or null if it does not exist (REQ-ADMIN-021).
export async function getOrder(id: string): Promise<Order | null> {
	const ref = doc(db(), ORDERS_COLLECTION, id);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	return toOrder(snap.id, snap.data() as Record<string, unknown>);
}

// Change an order's status and persist it (REQ-ADMIN-022). Releasing the
// reserved instances on cancellation is handled by a backend rule/function that
// reacts to the status change; the admin UI only records the new status.
export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
	const ref = doc(db(), ORDERS_COLLECTION, id);
	await updateDoc(ref, { status, statusUpdatedAt: serverTimestamp() });
}

// Number of items in an order, for compact list display.
export function itemCount(order: Order): number {
	return order.items.length;
}

// ---------------------------------------------------------------------------
// Placing a reservation from checkout (REQ-CHECKOUT-010)
//
// Checkout runs entirely client-side (no backend catalog yet, see
// src/lib/catalog.ts), so the order is written directly to Firestore with the
// client SDK. Firestore rules (firestore.rules) allow anyone to create an
// order but restrict reading/updating to admins, matching the write-once,
// admin-managed lifecycle used elsewhere in this module.
// ---------------------------------------------------------------------------

export type PlaceOrderInput = {
	contact: OrderContact;
	items: OrderItem[];
	// Order total in CZK, language-neutral string.
	total: string;
};

// Creates a new order with status "new". Returns the new order's id, used as
// its reference on the confirmation page (REQ-CHECKOUT-006).
export async function placeOrder(input: PlaceOrderInput): Promise<{ id: string }> {
	const ref = await addDoc(collection(db(), ORDERS_COLLECTION), {
		status: 'new',
		createdAt: serverTimestamp(),
		contact: input.contact,
		items: input.items,
		total: input.total
	});
	return { id: ref.id };
}
