import { isValidXml, extractCdata, substituteCdata } from '$lib/utils/xml';
import type { TranslationItem } from '$lib/types';
import type { AppState } from '$lib/state/appState.svelte';

const BATCH_SIZE = 100;

/**
 * Creates the handler that orchestrates the full XML translation session.
 *
 * The handler is intentionally async: it scans files, validates XML,
 * and drives a sequential per-file translation loop — updating reactive
 * state after every batch so the UI reflects live progress.
 *
 * @param state  Shared application state read and mutated throughout the flow.
 * @returns The `handleConfirm` async handler.
 */
export function createTranslateHandler(state: AppState) {
	/**
	 * Triggered when the user confirms translation in the dialog.
	 *
	 * Steps:
	 * 1. Reads each `.xml` file from the pending `FileList`.
	 * 2. Validates XML structure; silently skips malformed files.
	 * 3. Extracts all `<![CDATA[...]]>` segments as translation items.
	 * 4. Sends items to `/api/translate` in batches of {@link BATCH_SIZE}.
	 * 5. Updates per-file progress after every batch response.
	 * 6. Substitutes translated text back and stores the result.
	 * 7. Marks each file `done` on success or `error` on failure.
	 */
	async function handleConfirm(): Promise<void> {
		if (!state.pendingFiles) return;
		state.showConfirm = false;

		state.folderPath = state.pendingFolderName;
		state.translating = true;
		state.translatedContents.clear();
		state.fileMap.clear();
		state.xmlFiles = [];

		// ── Phase 1: scan & validate ──────────────────────────────────────────
		const scanned = [];
		for (const file of state.pendingFiles.filter((f) =>
			f.name.toLowerCase().endsWith('.xml')
		)) {
			const content = await file.text();
			if (!isValidXml(content)) continue;

			const items = extractCdata(content);
			scanned.push({
				name: file.name,
				lines: content.split('\n').length,
				totalStrings: items.length,
				translatedStrings: 0,
				status: 'pending' as const,
			});
			state.fileMap.set(file.name, file);
		}
		scanned.sort((a, b) => a.name.localeCompare(b.name));
		state.xmlFiles = scanned;
		state.pendingFiles = null;

		// ── Phase 2: translate sequentially ──────────────────────────────────
		for (const entry of state.xmlFiles) {
			const file = state.fileMap.get(entry.name);
			if (!file) continue;

			state.updateFile(entry.name, { status: 'in-progress', translatedStrings: 0 });

			try {
				const xml = await file.text();
				const allItems = extractCdata(xml);

				// Files with no CDATA strings are copied as-is
				if (allItems.length === 0) {
					state.translatedContents.set(entry.name, xml);
					state.updateFile(entry.name, { status: 'done' });
					continue;
				}

				const allTranslations: TranslationItem[] = [];

				for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
					const batch = allItems.slice(i, i + BATCH_SIZE);

					const res = await fetch('/api/translate', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ items: batch, filename: entry.name, apiKey: state.apiKey, provider: state.provider }),
					});

					if (!res.ok) {
						const body = await res.json().catch(() => ({ message: res.statusText }));
						throw new Error(body?.message ?? res.statusText);
					}

					const { items: translated } = await res.json();
					allTranslations.push(...translated);
					state.updateFile(entry.name, { translatedStrings: allTranslations.length });
				}

				state.translatedContents.set(entry.name, substituteCdata(xml, allTranslations));
				state.updateFile(entry.name, { status: 'done', translatedStrings: allItems.length });
			} catch (e) {
				const msg = (e as Error).message;
				console.error(`[${entry.name}]`, msg);
				state.updateFile(entry.name, { status: 'error', errorMsg: msg });
			}
		}

		state.translating = false;
	}

	return { handleConfirm };
}
