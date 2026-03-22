<script lang="ts">
	interface Props {
		folderPath: string;
		onSelect: (files: File[], folderName: string, xmlCount: number) => void;
	}

	const { folderPath, onSelect }: Props = $props();

	let isDragging = $state(false);

	// ── File input (browse) ────────────────────────────────────────────────────

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const files = Array.from(input.files);
		const firstFile = files[0] as File & { path?: string; webkitRelativePath: string };
		const folderName = firstFile.path
			? firstFile.path.replace(/[\\/][^\\/]+$/, '')
			: firstFile.webkitRelativePath.split('/')[0];

		const xmlCount = files.filter((f) => f.name.toLowerCase().endsWith('.xml')).length;
		onSelect(files, folderName, xmlCount);
	}

	// ── Folder drag-and-drop ───────────────────────────────────────────────────

	/** Recursively reads all files from a dropped directory entry. */
	async function readDirEntry(entry: FileSystemDirectoryEntry): Promise<File[]> {
		const reader = entry.createReader();
		const files: File[] = [];

		const readBatch = (): Promise<FileSystemEntry[]> =>
			new Promise((resolve, reject) => reader.readEntries(resolve, reject));

		let batch: FileSystemEntry[];
		do {
			batch = await readBatch();
			for (const child of batch) {
				if (child.isFile) {
					const file = await new Promise<File>((resolve, reject) =>
						(child as FileSystemFileEntry).file(resolve, reject)
					);
					files.push(file);
				} else if (child.isDirectory) {
					files.push(...(await readDirEntry(child as FileSystemDirectoryEntry)));
				}
			}
		} while (batch.length > 0);

		return files;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		// Only clear when leaving the drop zone entirely (not a child element)
		if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
			isDragging = false;
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const items = e.dataTransfer?.items;
		if (!items) return;

		for (const item of Array.from(items)) {
			const entry = item.webkitGetAsEntry();
			if (entry?.isDirectory) {
				const files = await readDirEntry(entry as FileSystemDirectoryEntry);
				const xmlCount = files.filter((f) => f.name.toLowerCase().endsWith('.xml')).length;
				onSelect(files, entry.name, xmlCount);
				return;
			}
		}
	}
</script>

<div class="space-y-2">
	<label for="folder-input" class="block text-sm text-foreground-dim">Source Folder</label>
	<div class="flex gap-3">
		<!-- Drop zone + path display -->
		<div
			role="region"
			aria-label="Drop folder here"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			class="flex-1 flex items-center gap-3 rounded-lg px-4 py-2.5 min-w-0 border transition-colors {isDragging
				? 'bg-primary-muted/20 border-primary-hover border-dashed'
				: 'bg-background border-border/60'}"
		>
			<svg
				class="w-4 h-4 shrink-0 transition-colors {isDragging ? 'text-primary-subtle' : 'text-primary-accent'}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				{#if isDragging}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
					/>
				{/if}
			</svg>
			<span class="text-sm truncate {folderPath ? 'text-foreground-bright' : isDragging ? 'text-primary-subtle' : 'text-foreground-subtle'}">
				{isDragging ? 'Drop folder here' : folderPath || 'No folder selected — or drag and drop'}
			</span>
		</div>

		<!-- Browse button -->
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
				class="inline-flex items-center gap-2 bg-primary-dim hover:bg-primary-strong border border-primary text-primary-fg text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
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
