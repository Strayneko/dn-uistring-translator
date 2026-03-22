<script lang="ts">
	import type { XmlFile } from '$lib/types';
	import FileRow from './FileRow.svelte';

	interface Props {
		files: XmlFile[];
		folderPath: string;
		doneCount: number;
		errorCount: number;
		totalCount: number;
		overallProgress: number;
		translating: boolean;
		paused: boolean;
		canDownload: boolean;
		zipFolderName: string;
		onDownload: () => void;
		onPause: () => void;
		onResume: () => void;
		onStop: () => void;
	}

	const {
		files,
		folderPath,
		doneCount,
		errorCount,
		totalCount,
		overallProgress,
		translating,
		paused,
		canDownload,
		zipFolderName,
		onDownload,
		onPause,
		onResume,
		onStop,
	}: Props = $props();
</script>

<div class="bg-surface border border-border/50 rounded-xl overflow-hidden">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-border/40">
		<div class="flex items-center gap-3">
			<h2 class="text-sm font-semibold text-primary-subtle uppercase tracking-wider">XML Files</h2>
			<span class="text-xs bg-primary-muted/60 text-primary-subtle px-2 py-0.5 rounded-full">
				{totalCount} files
			</span>
		</div>
		<div class="flex items-center gap-2 text-xs">
			<span class="px-2 py-0.5 rounded-full bg-success-muted/50 text-success-accent">
				{doneCount} translated
			</span>
			{#if errorCount > 0}
				<span class="px-2 py-0.5 rounded-full bg-destructive/50 text-destructive-accent">
					{errorCount} error{errorCount === 1 ? '' : 's'}
				</span>
			{/if}
			<span class="px-2 py-0.5 rounded-full bg-neutral-hover/60 text-foreground-muted">
				{totalCount} total
			</span>
		</div>
	</div>

	<!-- Overall progress bar -->
	{#if totalCount > 0}
		<div class="px-6 py-3 border-b border-border/30 bg-inset">
			<div class="flex items-center gap-3">
				<div class="flex-1 h-1.5 bg-neutral rounded-full overflow-hidden">
					<div
						class="h-full bg-primary-hover rounded-full transition-all duration-500"
						style="width: {overallProgress}%"
					></div>
				</div>
				<span class="text-xs text-foreground-muted w-10 text-right">{overallProgress}%</span>

				{#if translating}
					<!-- Pause / Resume -->
					<button
						onclick={paused ? onResume : onPause}
						class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors
							{paused
								? 'bg-primary/20 border-primary/40 text-primary-accent hover:bg-primary/30'
								: 'bg-neutral border-border/60 text-foreground-dim hover:bg-neutral-hover'}"
						aria-label={paused ? 'Resume translation' : 'Pause translation'}
					>
						{#if paused}
							<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z"/>
							</svg>
							Resume
						{:else}
							<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
							</svg>
							Pause
						{/if}
					</button>

					<!-- Stop -->
					<button
						onclick={onStop}
						class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border bg-destructive/20 border-destructive/40 text-destructive-accent hover:bg-destructive/30 transition-colors"
						aria-label="Stop translation"
					>
						<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 6h12v12H6z"/>
						</svg>
						Stop
					</button>
				{/if}
			</div>

			{#if paused && translating}
				<p class="text-xs text-primary-accent mt-2">Paused — will resume after the current request completes.</p>
			{/if}
		</div>
	{/if}

	<!-- File rows -->
	{#if files.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-foreground-subtle">
			<svg
				class="w-12 h-12 mb-3 text-neutral-hover"
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
			class="divide-y divide-border/30 max-h-104 overflow-y-auto
				[&::-webkit-scrollbar]:w-1.5
				[&::-webkit-scrollbar-track]:bg-background
				[&::-webkit-scrollbar-thumb]:bg-primary-dim
				[&::-webkit-scrollbar-thumb]:rounded-full
				[&::-webkit-scrollbar-thumb:hover]:bg-primary"
		>
			{#each files as file (file.name)}
				<FileRow {file} />
			{/each}
		</ul>

		<!-- Download ZIP -->
		{#if canDownload}
			<div class="px-6 py-4 border-t border-border/40 flex justify-end">
				<button
					onclick={onDownload}
					class="inline-flex items-center gap-2 bg-success hover:bg-success-hover text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-success-muted/30"
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
