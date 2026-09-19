// Shared contact details (email/phone) for the footer and the contact page.
//
// The raw values are kept reversed here so a plain-text scraper reading the
// source can't harvest them directly, and `decode()` should only be called
// once the visitor explicitly asks to reveal the value (e.g. behind a
// click-to-reveal button, see src/routes/+layout.svelte and
// src/routes/kontakt/+page.svelte). Do NOT decode eagerly at module scope -
// that would put the plaintext into the prerendered HTML regardless of
// whether the visitor ever clicks to reveal it.
export const EMAIL_REVERSED = 'moc.liamg@avokinotrab.adal';
export const PHONE_REVERSED = '951483677024+';

export function decodeContact(reversed: string): string {
	return reversed.split('').reverse().join('');
}

// Format a phone number for display by grouping the local digits in threes
// (e.g. "+420776384159" -> "+420 776 384 159") so it is easier to read. The
// `tel:` href should still use the raw, unspaced value.
export function formatPhone(phone: string): string {
	const match = phone.match(/^(\+\d{1,3})(\d+)$/);
	if (!match) return phone;
	const [, prefix, rest] = match;
	const grouped = rest.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${prefix} ${grouped}`;
}
