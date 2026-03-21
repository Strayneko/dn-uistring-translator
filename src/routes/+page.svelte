<script lang="ts">
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import FolderSelector from '$lib/components/FolderSelector.svelte';
	import XmlFileList from '$lib/components/FileList.svelte';

	import { AppState } from '$lib/state/appState.svelte';
	import { createFolderHandlers } from '$lib/handlers/folderHandler';
	import { createTranslateHandler } from '$lib/handlers/translateHandler';
	import { createDownloadHandler } from '$lib/handlers/downloadHandler';

	const state = new AppState();

	const { handleFolderSelect, handleCancel } = createFolderHandlers(state);
	const { handleConfirm } = createTranslateHandler(state);
	const { handleDownload } = createDownloadHandler(state);
</script>

<ConfirmDialog
	show={state.showConfirm}
	folderName={state.pendingFolderName}
	fileCount={state.pendingFileCount}
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

<div class="min-h-screen bg-[#07111f] text-slate-100 font-sans">
	<!-- Header -->
	<header class="border-b border-blue-900/50 bg-[#0a1929] px-8 py-5">
		<div class="max-w-4xl mx-auto flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
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
				<h1 class="text-lg font-semibold text-white">XML String Translator</h1>
				<p class="text-xs text-slate-400">Powered by Google Translate</p>
			</div>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-8 py-8 space-y-6">
		<!-- Configuration -->
		<div class="bg-[#0d2137] border border-blue-900/50 rounded-xl p-6 space-y-5">
			<h2 class="text-sm font-semibold text-blue-300 uppercase tracking-wider">Configuration</h2>
			<FolderSelector folderPath={state.folderPath} onSelect={handleFolderSelect} />
		</div>

		<!-- File list -->
		<XmlFileList
			files={state.xmlFiles}
			folderPath={state.folderPath}
			doneCount={state.doneCount}
			totalCount={state.totalCount}
			overallProgress={state.overallProgress}
			allDone={state.allDone}
			hasSuccessful={state.hasSuccessful}
			zipFolderName={state.zipFolderName}
			onDownload={handleDownload}
		/>
	</main>
</div>
