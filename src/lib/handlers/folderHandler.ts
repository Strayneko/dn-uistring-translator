import type { AppState } from '$lib/state/appState.svelte';

/**
 * Creates handlers that manage the folder-selection flow.
 *
 * The two handlers work as a pair around the confirmation dialog:
 * `handleFolderSelect` opens it; `handleCancel` closes it without action.
 *
 * @param state  Shared application state mutated by these handlers.
 * @returns An object containing the two handler functions.
 */
export function createFolderHandlers(state: AppState) {
	/**
	 * Called by `FolderSelector` when the user picks a folder from the OS picker.
	 *
	 * Stores the raw `FileList` and detected metadata in pending state, then
	 * surfaces the confirmation dialog so the user can review before translating.
	 *
	 * @param files       Raw `FileList` from the `<input>` element.
	 * @param folderName  Detected folder path shown in the confirmation dialog.
	 * @param xmlCount    Number of `.xml` files found in the selection.
	 */
	function handleFolderSelect(files: FileList, folderName: string, xmlCount: number): void {
		state.pendingFiles = files;
		state.pendingFolderName = folderName;
		state.pendingFileCount = xmlCount;
		state.showConfirm = true;
	}

	/**
	 * Called when the user dismisses the confirmation dialog without confirming.
	 *
	 * Hides the dialog and resets all pending folder data so a subsequent
	 * folder pick starts from a clean state.
	 */
	function handleCancel(): void {
		state.showConfirm = false;
		state.pendingFiles = null;
		state.pendingFolderName = '';
		state.pendingFileCount = 0;
	}

	return { handleFolderSelect, handleCancel };
}
