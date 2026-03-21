<script lang="ts">
	const PROVIDERS = [{ value: 'google', label: 'Google Translate' }] as const;

	interface Props {
		show: boolean;
		/** When false the modal cannot be dismissed — used on first-time setup. */
		canClose: boolean;
		currentProvider: string;
		currentApiKey: string;
		onSave: (provider: string, apiKey: string) => Promise<string | null>;
		onClose: () => void;
	}

	const { show, canClose, currentProvider, currentApiKey, onSave, onClose }: Props = $props();

	let provider = $state('');
	let apiKey = $state('');
	let showKey = $state(false);
	let saving = $state(false);
	let errorMsg = $state('');

	// Sync form values from props whenever the modal opens
	$effect(() => {
		if (show) {
			provider = currentProvider;
			apiKey = currentApiKey;
			showKey = false;
			errorMsg = '';
		}
	});

	const canSave = $derived(apiKey.trim().length > 0);

	const providerLabels: Record<string, { name: string; keyLabel: string; keyPlaceholder: string }> =
		{
			google: {
				name: 'Google Translate',
				keyLabel: 'Google Translate API Key',
				keyPlaceholder: 'AIza...',
			},
		};

	const activeProvider = $derived(providerLabels[provider] ?? providerLabels['google']);

	function handleBackdrop() {
		if (canClose) onClose();
	}

	async function handleSave() {
		if (!canSave || saving) return;
		saving = true;
		errorMsg = '';
		const err = await onSave(provider, apiKey.trim());
		saving = false;
		if (err) errorMsg = err;
	}
</script>

{#if show}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={handleBackdrop}
	>
		<!-- Modal -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-title"
			tabindex="-1"
			class="w-full max-w-md mx-4 bg-[#0d2137] border border-blue-800/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="px-6 pt-6 pb-4 border-b border-blue-900/40 flex items-start justify-between">
				<div class="flex items-start gap-4">
					<div
						class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0 mt-0.5"
					>
						<svg
							class="w-5 h-5 text-blue-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<div>
						<h2 class="text-base font-semibold text-white">Translation Settings</h2>
						<p class="text-sm text-slate-400 mt-0.5">
							{canClose ? 'Update your provider and API key.' : 'Set up your provider and API key to get started.'}
						</p>
					</div>
				</div>

				{#if canClose}
					<button
						onclick={onClose}
						class="text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
						aria-label="Close settings"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>

			<!-- Body -->
			<div class="px-6 py-5 space-y-4">
				<!-- Provider selector -->
				<div class="space-y-1.5">
					<label for="provider-select" class="block text-sm text-slate-300">Provider</label>
					<select
						id="provider-select"
						bind:value={provider}
						class="w-full bg-[#07111f] border border-blue-900/60 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
					>
						{#each PROVIDERS as p (p.value)}
							<option value={p.value}>{p.label}</option>
						{/each}
					</select>
				</div>

				<!-- API key input -->
				<div class="space-y-1.5">
					<label for="api-key-input" class="block text-sm text-slate-300">
						{activeProvider.keyLabel}
					</label>
					<div class="relative">
						<input
							id="api-key-input"
							type={showKey ? 'text' : 'password'}
							bind:value={apiKey}
							placeholder={activeProvider.keyPlaceholder}
							class="w-full bg-[#07111f] border border-blue-900/60 text-slate-200 text-sm rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
						/>
						<button
							type="button"
							onclick={() => (showKey = !showKey)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
							aria-label={showKey ? 'Hide API key' : 'Show API key'}
						>
							{#if showKey}
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
								</svg>
							{:else}
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							{/if}
						</button>
					</div>
					{#if !canClose}
						<p class="text-xs text-slate-500">Your key is stored locally in your browser and never shared.</p>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="px-6 pb-6 space-y-3">
				{#if errorMsg}
					<p class="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{errorMsg}</p>
				{/if}
				<div class="flex justify-end">
					<button
						onclick={handleSave}
						disabled={!canSave || saving}
						class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
					>
						{#if saving}
							<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							Validating…
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							Save
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
