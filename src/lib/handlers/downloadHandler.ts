import JSZip from 'jszip';
import type { AppState } from '$lib/state/appState.svelte';

/**
 * Creates the handler that packages all translated files into a ZIP archive.
 *
 * @param state  Shared application state providing translated content and folder name.
 * @returns The `handleDownload` async handler.
 */
export function createDownloadHandler(state: AppState) {
	/**
	 * Packages every successfully translated XML file into a single ZIP archive
	 * and triggers a browser download named after the source folder.
	 *
	 * Uses the in-memory `translatedContents` map populated during translation,
	 * so no server round-trip is needed at download time.
	 */
	async function handleDownload(): Promise<void> {
		const zip = new JSZip();

		for (const [name, content] of state.translatedContents) {
			zip.file(name, content);
		}

		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `${state.zipFolderName}.zip`;
		a.click();

		URL.revokeObjectURL(url);
	}

	return { handleDownload };
}
