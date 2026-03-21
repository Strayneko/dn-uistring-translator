<script lang="ts">
	import type { XmlFile } from '$lib/types';

	const STATUS_CONFIG = {
		pending: { label: 'Pending', class: 'bg-slate-700 text-slate-300' },
		'in-progress': { label: 'In Progress', class: 'bg-blue-700 text-blue-200' },
		done: { label: 'Done', class: 'bg-emerald-800 text-emerald-300' },
		error: { label: 'Error', class: 'bg-red-900 text-red-300' },
	} as const;

	interface Props {
		file: XmlFile;
	}

	const { file }: Props = $props();

	const statusCfg = $derived(STATUS_CONFIG[file.status]);
	const fileProgress = $derived(
		file.totalStrings > 0 ? Math.round((file.translatedStrings / file.totalStrings) * 100) : 0
	);
</script>

<li class="flex items-center gap-4 px-6 py-4 hover:bg-blue-900/10 transition-colors">
	<div
		class="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0"
	>
		<svg
			class="w-4 h-4 text-blue-400"
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
	</div>

	<div class="flex-1 min-w-0">
		<p class="text-sm font-medium text-slate-100 truncate">{file.name}</p>

		{#if file.status === 'error' && file.errorMsg}
			<p class="text-xs text-red-400 mt-0.5 truncate" title={file.errorMsg}>{file.errorMsg}</p>
		{:else if file.status === 'in-progress' && file.totalStrings > 0}
			<div class="flex items-center gap-2 mt-1.5">
				<div class="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
					<div
						class="h-full bg-blue-500 rounded-full transition-all duration-300"
						style="width: {fileProgress}%"
					></div>
				</div>
				<span class="text-xs text-slate-400 shrink-0">
					{file.translatedStrings} / {file.totalStrings} strings
				</span>
			</div>
		{:else}
			<p class="text-xs text-slate-500 mt-0.5">{file.lines.toLocaleString()} lines</p>
		{/if}
	</div>

	<span class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0 {statusCfg.class}">
		{statusCfg.label}
	</span>
</li>
