// The cart itself is client-side only (localStorage), so this page has no
// server/build-time data dependency and can be prerendered as a static shell
// that hydrates and reads the cart store on the client, same approach as the
// rest of the public site.
export const prerender = true;
