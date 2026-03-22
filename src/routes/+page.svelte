<script lang="ts">
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import FolderSelector from '$lib/components/FolderSelector.svelte';
	import XmlFileList from '$lib/components/FileList.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';

	import { AppState } from '$lib/state/appState.svelte';
	import { createFolderHandlers } from '$lib/handlers/folderHandler';
	import { createTranslateHandler } from '$lib/handlers/translateHandler';
	import { createDownloadHandler } from '$lib/handlers/downloadHandler';
	import { createSettingsHandlers } from '$lib/handlers/settingsHandler';

	const state = new AppState();

	const { handleFolderSelect, handleCancel } = createFolderHandlers(state);
	const { handleConfirm } = createTranslateHandler(state);
	const { handleDownload } = createDownloadHandler(state);
	const { handleOpenSettings, handleSaveSettings } = createSettingsHandlers(state);

	$effect(() => state.init());
</script>

<SettingsModal
	show={state.showSettings}
	canClose={state.isConfigured}
	currentProvider={state.provider}
	currentApiKey={state.apiKey}
	onSave={handleSaveSettings}
	onClose={() => (state.showSettings = false)}
/>

<ConfirmDialog
	show={state.showConfirm}
	folderName={state.pendingFolderName}
	fileCount={state.pendingFileCount}
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

<div class="min-h-screen bg-background text-foreground font-sans">
	<!-- Header -->
	<header class="border-b border-border/50 bg-header px-8 py-5">
		<div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
					<svg
						class="w-5 h-5 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
						/>
					</svg> 
				</div>
				<div>
					<h1 class="text-lg font-semibold text-white">Uistring Translator</h1>
					<p class="text-xs text-foreground-muted">Created by <a href="https://github.com/strayneko" target="_blank" rel="noopener noreferrer" class="text-primary-accent underline underline-offset-2 hover:text-primary-subtle transition-colors">Strayneko</a></p>
				</div>
			</div>

			<!-- Settings button -->
			<button
				onclick={handleOpenSettings}
				class="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground-dim bg-neutral/60 hover:bg-neutral-hover/60 border border-neutral-hover/60 px-3 py-1.5 rounded-lg transition-colors"
				aria-label="Open settings"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				Settings
			</button>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-8 py-8 space-y-6">
		<!-- Configuration -->
		<div class="bg-surface border border-border/50 rounded-xl p-6 space-y-5">
			<h2 class="text-sm font-semibold text-primary-subtle uppercase tracking-wider">Configuration</h2>
			<FolderSelector folderPath={state.folderPath} onSelect={handleFolderSelect} />
		</div>

		<!-- File list -->
		<XmlFileList
			files={state.xmlFiles}
			folderPath={state.folderPath}
			doneCount={state.doneCount}
			errorCount={state.errorCount}
			totalCount={state.totalCount}
			overallProgress={state.overallProgress}
			allDone={state.allDone}
			hasSuccessful={state.hasSuccessful}
			zipFolderName={state.zipFolderName}
			onDownload={handleDownload}
		/>
	</main>
</div>
