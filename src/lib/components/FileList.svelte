<script lang="ts">
	import type { XmlFile } from '$lib/types';
	import FileRow from './FileRow.svelte';

	interface Props {
		files: XmlFile[];
		folderPath: string;
		doneCount: number;
		totalCount: number;
		overallProgress: number;
		allDone: boolean;
		hasSuccessful: boolean;
		zipFolderName: string;
		onDownload: () => void;
	}

	const {
		files,
		folderPath,
		doneCount,
		totalCount,
		overallProgress,
		allDone,
		hasSuccessful,
		zipFolderName,
		onDownload,
	}: Props = $props();
</script>

<div class="bg-[#0d2137] border border-blue-900/50 rounded-xl overflow-hidden">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-blue-900/40">
		<div class="flex items-center gap-3">
			<h2 class="text-sm font-semibold text-blue-300 uppercase tracking-wider">XML Files</h2>
			<span class="text-xs bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">
				{totalCount} files
			</span>
		</div>
		<span class="text-sm text-slate-400">{doneCount} / {totalCount} translated</span>
	</div>

	<!-- Overall progress bar -->
	{#if totalCount > 0}
		<div class="px-6 py-3 border-b border-blue-900/30 bg-[#091a2e]">
			<div class="flex items-center gap-3">
				<div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
					<div
						class="h-full bg-blue-500 rounded-full transition-all duration-500"
						style="width: {overallProgress}%"
					></div>
				</div>
				<span class="text-xs text-slate-400 w-10 text-right">{overallProgress}%</span>
			</div>
		</div>
	{/if}

	<!-- File rows -->
	{#if files.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-slate-500">
			<svg
				class="w-12 h-12 mb-3 text-slate-700"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
				/>
			</svg>
			<p class="text-sm">
				{folderPath ? 'No valid XML files found in this folder' : 'Select a folder to see XML files'}
			</p>
		</div>
	{:else}
		<ul
			class="divide-y divide-blue-900/30 max-h-104 overflow-y-auto
				[&::-webkit-scrollbar]:w-1.5
				[&::-webkit-scrollbar-track]:bg-[#07111f]
				[&::-webkit-scrollbar-thumb]:bg-blue-800
				[&::-webkit-scrollbar-thumb]:rounded-full
				[&::-webkit-scrollbar-thumb:hover]:bg-blue-600"
		>
			{#each files as file (file.name)}
				<FileRow {file} />
			{/each}
		</ul>

		<!-- Download ZIP -->
		{#if allDone && hasSuccessful}
			<div class="px-6 py-4 border-t border-blue-900/40 flex justify-end">
				<button
					onclick={onDownload}
					class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
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
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					Download ZIP — {zipFolderName}.zip
				</button>
			</div>
		{/if}
	{/if}
</div>
