<script lang="ts">
	interface Props {
		folderPath: string;
		onSelect: (files: FileList, folderName: string, xmlCount: number) => void;
	}

	const { folderPath, onSelect }: Props = $props();

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const firstFile = input.files[0] as File & { path?: string; webkitRelativePath: string };
		const detectedPath = firstFile.path
			? firstFile.path.replace(/[\\/][^\\/]+$/, '')
			: firstFile.webkitRelativePath.split('/')[0];

		const xmlCount = Array.from(input.files).filter((f) =>
			f.name.toLowerCase().endsWith('.xml')
		).length;

		onSelect(input.files, detectedPath, xmlCount);
	}
</script>

<div class="space-y-2">
	<label for="folder-input" class="block text-sm text-slate-300">Source Folder</label>
	<div class="flex gap-3">
		<div
			class="flex-1 flex items-center gap-3 bg-[#07111f] border border-blue-900/60 rounded-lg px-4 py-2.5 min-w-0"
		>
			<svg
				class="w-4 h-4 text-blue-400 shrink-0"
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
			<span class="text-sm truncate {folderPath ? 'text-slate-200' : 'text-slate-500'}">
				{folderPath || 'No folder selected'}
			</span>
		</div>

		<label class="cursor-pointer" for="folder-input">
			<input
				id="folder-input"
				type="file"
				class="sr-only"
				onchange={handleChange}
				webkitdirectory
				multiple
			/>
			<span
				class="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-blue-100 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
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
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
					/>
				</svg>
				Browse
			</span>
		</label>
	</div>
</div>
