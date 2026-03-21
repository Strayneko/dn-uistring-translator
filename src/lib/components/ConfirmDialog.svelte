<script lang="ts">
	interface Props {
		show: boolean;
		folderName: string;
		fileCount: number;
		onConfirm: () => void;
		onCancel: () => void;
	}

	const { show, folderName, fileCount, onConfirm, onCancel }: Props = $props();
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div
			class="w-full max-w-md mx-4 bg-[#0d2137] border border-blue-800/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
		>
			<div class="px-6 pt-6 pb-4 border-b border-blue-900/40">
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
								d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
							/>
						</svg>
					</div>
					<div>
						<h2 id="confirm-title" class="text-base font-semibold text-white">
							Translate XML files?
						</h2>
						<p class="text-sm text-slate-400 mt-0.5">
							The following folder will be scanned and all valid XML files will be translated.
						</p>
					</div>
				</div>
			</div>

			<div class="px-6 py-4 space-y-3">
				<div class="bg-[#07111f] border border-blue-900/50 rounded-lg px-4 py-3">
					<p class="text-xs text-slate-500 mb-1">Folder path</p>
					<p class="text-sm text-slate-200 font-mono break-all">{folderName}</p>
				</div>
				<div class="flex items-center gap-2 text-sm text-slate-400">
					<svg
						class="w-4 h-4 text-blue-500 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					{#if fileCount === 0}
						No XML files detected
					{:else}
						<span
							><span class="text-blue-300 font-medium">{fileCount}</span> XML
							{fileCount === 1 ? 'file' : 'files'} detected</span
						>
					{/if}
				</div>
			</div>

			<div class="px-6 pb-6 flex gap-3 justify-end">
				<button
					onclick={onCancel}
					class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={onConfirm}
					disabled={fileCount === 0}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
				>
					<svg
						class="w-4 h-4"
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
					Translate
				</button>
			</div>
		</div>
	</div>
{/if}
