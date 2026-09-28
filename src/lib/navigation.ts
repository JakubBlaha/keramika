// Client-side navigation to an app route in the active locale.
//
// Takes the output of resolve() - so route ids and params stay type-checked,
// which is what the svelte/no-navigation-without-resolve rule is after - and
// adds the locale prefix with localizeHref(). The rule cannot see through
// localizeHref(), so this is the single place that is exempt from it.

import { goto } from '$app/navigation';
import type { resolve } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime';

export function gotoLocalized(path: ReturnType<typeof resolve>): Promise<void> {
	// eslint-disable-next-line svelte/no-navigation-without-resolve -- `path` comes from resolve()
	return goto(localizeHref(path));
}
