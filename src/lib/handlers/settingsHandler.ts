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
	 * Persists the chosen provider and API key, then closes the modal.
	 *
	 * @param provider  Provider identifier (e.g. `'google'`).
	 * @param apiKey    The user's API key for the chosen provider.
	 */
	function handleSaveSettings(provider: string, apiKey: string): void {
		state.saveSettings(provider, apiKey);
	}

	return { handleOpenSettings, handleSaveSettings };
}
