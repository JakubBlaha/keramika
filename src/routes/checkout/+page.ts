// Checkout is client-side only: it reads the cart from localStorage and (on
// submit) writes an order directly to Firestore via $lib/orders.ts. There is
// no server/build-time data dependency, so this page prerenders as a static
// shell that hydrates on the client, same approach as /cart.
export const prerender = true;
