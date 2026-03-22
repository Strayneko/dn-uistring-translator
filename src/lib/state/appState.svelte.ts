import { SvelteMap } from 'svelte/reactivity';
import type { XmlFile } from '$lib/types';

/**
 * Central reactive state for the XML translation session.
 *
 * Instantiate once at the top of `+page.svelte` and pass the instance
 * into every handler factory. Svelte 5 runes inside a class are only
 * reactive when the class is instantiated inside a component or a
 * `.svelte.ts` module.
 */
export class AppState {
	// ── Core translation state ────────────────────────────────────────────────

	/** Absolute path of the folder chosen by the user. */
	folderPath = $state('');

	/** Validated XML files found in the selected folder. */
	xmlFiles = $state<XmlFile[]>([]);

	/** True while the translation loop is running. */
	translating = $state(false);

	/** Raw File objects keyed by filename — populated during folder scan. */
	readonly fileMap = new SvelteMap<string, File>();

	/** Final translated XML strings keyed by filename — populated per file. */
	readonly translatedContents = new SvelteMap<string, string>();

	// ── Settings state ────────────────────────────────────────────────────────

	/** Selected translation provider identifier. */
	provider = $state('google');

	/** User-supplied API key, loaded from and persisted to localStorage. */
	apiKey = $state('');

	/** LibreTranslate endpoint URL, persisted to localStorage. */
	libretranslateUrl = $state('https://libretranslate.com/translate');

	/** Whether the settings modal is open. */
	showSettings = $state(false);

	/** Whether translation is currently paused by the user. */
	paused = $state(false);

	/** Whether the user has requested an early stop. */
	stopped = $state(false);

	/** True once the user has saved a non-empty API key, or is using a keyless provider. */
	readonly isConfigured = $derived(
		this.provider === 'google-free' ||
		this.provider === 'libretranslate' ||
		this.apiKey.trim().length > 0
	);

	/**
	 * Reads persisted settings from localStorage and opens the settings modal
	 * if no API key has been configured yet. Call once on app mount.
	 */
	init(): void {
		if (typeof window === 'undefined') return;
		this.provider = localStorage.getItem('translationProvider') ?? 'google';
		this.apiKey = localStorage.getItem('translationApiKey') ?? '';
		this.libretranslateUrl = localStorage.getItem('libretranslateUrl') ?? 'https://libretranslate.com/translate';
		const keylessProvider = this.provider === 'google-free' || this.provider === 'libretranslate';
		if (!this.apiKey && !keylessProvider) this.showSettings = true;
	}

	/**
	 * Persists the provider and API key to localStorage and closes the modal.
	 *
	 * @param provider  Provider identifier (e.g. `'google'`).
	 * @param apiKey    The user's API key for the chosen provider.
	 */
	saveSettings(provider: string, apiKey: string, libretranslateUrl?: string): void {
		this.provider = provider;
		this.apiKey = apiKey.trim();
		if (libretranslateUrl !== undefined) {
			this.libretranslateUrl = libretranslateUrl.trim() || 'https://libretranslate.com/translate';
			localStorage.setItem('libretranslateUrl', this.libretranslateUrl);
		}
		localStorage.setItem('translationProvider', provider);
		localStorage.setItem('translationApiKey', this.apiKey);
		this.showSettings = false;
	}

	// ── Confirmation dialog state ─────────────────────────────────────────────

	/** Files from the OS picker or drag-and-drop, held until the user confirms or cancels. */
	pendingFiles = $state<File[] | null>(null);

	/** Detected folder name shown inside the confirmation dialog. */
	pendingFolderName = $state('');

	/** Number of XML files in the pending selection, shown in the dialog. */
	pendingFileCount = $state(0);

	/** Whether the confirmation dialog is visible. */
	showConfirm = $state(false);

	// ── Derived values ────────────────────────────────────────────────────────

	/** Number of files that finished successfully. */
	readonly doneCount = $derived(this.xmlFiles.filter((f) => f.status === 'done').length);

	/** Number of files that failed with an error. */
	readonly errorCount = $derived(this.xmlFiles.filter((f) => f.status === 'error').length);

	/** Total number of validated XML files in the current session. */
	readonly totalCount = $derived(this.xmlFiles.length);

	/** Overall translation progress as a 0–100 integer percentage. */
	readonly overallProgress = $derived(
		this.totalCount > 0 ? Math.round((this.doneCount / this.totalCount) * 100) : 0
	);

	/** True once every file has reached a terminal state (done or error). */
	readonly allDone = $derived(
		this.totalCount > 0 &&
			!this.translating &&
			this.xmlFiles.every((f) => f.status === 'done' || f.status === 'error')
	);

	/** True if at least one file translated successfully (enables ZIP download). */
	readonly hasSuccessful = $derived(this.xmlFiles.some((f) => f.status === 'done'));

	/** True when a ZIP download can be offered — either all done or user stopped early. */
	readonly canDownload = $derived((this.allDone || this.stopped) && this.hasSuccessful);

	/** Last path segment of `folderPath`, used as the ZIP archive name. */
	readonly zipFolderName = $derived(
		this.folderPath.split(/[/\\]/).filter(Boolean).at(-1) ?? 'translated'
	);

	// ── Mutation helpers ──────────────────────────────────────────────────────

	/**
	 * Applies a partial update to a single file entry by name.
	 *
	 * @param name  Filename to target.
	 * @param patch Fields to merge into the existing `XmlFile` record.
	 */
	updateFile(name: string, patch: Partial<XmlFile>): void {
		this.xmlFiles = this.xmlFiles.map((f) => (f.name === name ? { ...f, ...patch } : f));
	}
}
