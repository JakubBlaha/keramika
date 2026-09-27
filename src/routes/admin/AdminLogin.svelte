<script lang="ts">
	// Admin login form (REQ-ADMIN-002, REQ-ADMIN-003, REQ-ADMIN-017). Shown by
	// the admin layout whenever there is no authenticated admin. Submits
	// email/password to Firebase Authentication; on invalid credentials or a
	// non-admin account an error is shown and no admin content is revealed.
	import { adminLogin, adminLoginWithGoogle } from '$lib/adminAuth';
	import { m } from '$lib/paraglide/messages';

	// `notAdmin` is true when the visitor is signed in with a valid account that
	// lacks the admin claim; we still show the form but explain the rejection.
	let { notAdmin = false }: { notAdmin?: boolean } = $props();

	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let googleSubmitting = $state(false);
	let error = $state(false);

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (submitting || googleSubmitting) return;
		submitting = true;
		error = false;
		try {
			await adminLogin(email.trim(), password);
			// On success the auth listener flips the layout to the admin UI; no
			// navigation needed here.
		} catch {
			error = true;
		} finally {
			submitting = false;
		}
	}

	async function onGoogle() {
		if (submitting || googleSubmitting) return;
		googleSubmitting = true;
		error = false;
		try {
			await adminLoginWithGoogle();
			// On success the auth listener flips the layout to the admin UI.
		} catch (err) {
			// A user closing the popup is not an error worth surfacing.
			const code = (err as { code?: string } | null)?.code ?? '';
			if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
				error = true;
			}
		} finally {
			googleSubmitting = false;
		}
	}
</script>

<div class="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
	<div class="rounded-[4px] border border-line bg-white p-6">
		<h1 class="mb-1 text-[1.4rem]">{m.admin_login_heading()}</h1>
		<p class="mb-5 text-[0.9rem] text-ink-soft">{m.admin_login_intro()}</p>

		<form class="flex flex-col gap-4" onsubmit={onSubmit}>
			<label class="flex flex-col gap-1 text-[0.85rem]">
				<span class="text-ink-soft">{m.admin_login_email()}</span>
				<input
					type="email"
					name="email"
					autocomplete="username"
					required
					bind:value={email}
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-col gap-1 text-[0.85rem]">
				<span class="text-ink-soft">{m.admin_login_password()}</span>
				<input
					type="password"
					name="password"
					autocomplete="current-password"
					required
					bind:value={password}
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
				/>
			</label>

			{#if notAdmin}
				<p class="text-[0.85rem] text-accent-dark">{m.admin_login_not_admin()}</p>
			{:else if error}
				<p class="text-[0.85rem] text-accent-dark">{m.admin_login_error()}</p>
			{/if}

			<button
				type="submit"
				class="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
				disabled={submitting}
			>
				{submitting ? m.admin_login_submitting() : m.admin_login_submit()}
			</button>
		</form>

		<div class="my-4 flex items-center gap-3 text-[0.8rem] text-ink-soft">
			<span class="h-px flex-1 bg-line"></span>
			<span>{m.admin_login_or()}</span>
			<span class="h-px flex-1 bg-line"></span>
		</div>

		<button
			type="button"
			class="btn w-full border border-line bg-white disabled:cursor-not-allowed disabled:opacity-50"
			disabled={submitting || googleSubmitting}
			onclick={onGoogle}
		>
			<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
				<path
					fill="#4285F4"
					d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
				/>
				<path
					fill="#34A853"
					d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
				/>
				<path
					fill="#FBBC05"
					d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
				/>
				<path
					fill="#EA4335"
					d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
				/>
			</svg>
			{googleSubmitting ? m.admin_login_google_pending() : m.admin_login_google()}
		</button>
	</div>
</div>
