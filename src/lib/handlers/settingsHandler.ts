import type { AppState } from '$lib/state/appState.svelte';

/**
 * Creates handlers for the settings modal.
 *
 * @param state  Shared application state.
 * @returns An object with `handleOpenSettings` and `handleSaveSettings`.
 */
export function createSettingsHandlers(state: AppState) {
	/**
	 * Opens the settings modal. Used by the settings button in the header
	 * when the user wants to change their provider or API key.
	 */
	function handleOpenSettings(): void {
		state.showSettings = true;
	}

	/**
	 * Validates the API key against the translate endpoint, then persists
	 * the provider and key if valid.
	 *
	 * @param provider  Provider identifier (e.g. `'google'`).
	 * @param apiKey    The user's API key for the chosen provider.
	 * @returns `null` on success, or an error message string on failure.
	 */
	async function handleSaveSettings(provider: string, apiKey: string): Promise<string | null> {
		try {
			const res = await fetch('/api/translate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: [{ id: 1, text: 'test' }], filename: 'validation', apiKey }),
			});

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				return body?.message ?? res.statusText;
			}
		} catch {
			return 'Could not reach the translation service. Check your connection.';
		}

		state.saveSettings(provider, apiKey);
		return null;
	}

	return { handleOpenSettings, handleSaveSettings };
}
