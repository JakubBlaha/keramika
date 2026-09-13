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
					class="rounded-[4px] border border-line px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
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
					class="rounded-[4px] border border-line px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
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
			{googleSubmitting ? m.admin_login_google_pending() : m.admin_login_google()}
		</button>
	</div>
</div>
