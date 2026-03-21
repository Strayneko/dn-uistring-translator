<script lang="ts">
	type XmlFile = {
		name: string;
		lines: number;
		status: 'pending' | 'in-progress' | 'done' | 'error';
	};

	let folderPath = $state('');
	let xmlFiles = $state<XmlFile[]>([]);
	let translating = $state(false);

	// Confirmation dialog state
	let pendingFiles = $state<FileList | null>(null);
	let pendingFolderName = $state('');
	let pendingFileCount = $state(0);
	let showConfirm = $state(false);

	const statusConfig = {
		pending: { label: 'Pending', class: 'bg-slate-700 text-slate-300' },
		'in-progress': { label: 'In Progress', class: 'bg-blue-700 text-blue-200 animate-pulse' },
		done: { label: 'Done', class: 'bg-emerald-800 text-emerald-300' },
		error: { label: 'Error', class: 'bg-red-900 text-red-300' },
	};

	let doneCount = $derived(xmlFiles.filter((f) => f.status === 'done').length);
	let totalCount = $derived(xmlFiles.length);
	let overallProgress = $derived(totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0);

	function isValidXml(content: string): boolean {
		const doc = new DOMParser().parseFromString(content, 'text/xml');
		return doc.querySelector('parsererror') === null;
	}

	function handleFolderSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const firstFile = input.files[0] as any;
		const detectedPath = firstFile.path
			? firstFile.path.replace(/[\\/][^\\/]+$/, '')
			: firstFile.webkitRelativePath.split('/')[0];

		pendingFiles = input.files;
		pendingFolderName = detectedPath;
		pendingFileCount = Array.from(input.files).filter((f) =>
			f.name.toLowerCase().endsWith('.xml')
		).length;
		showConfirm = true;
	}

	function cancelTranslate() {
		showConfirm = false;
		pendingFiles = null;
		pendingFolderName = '';
		pendingFileCount = 0;
	}

	async function confirmTranslate() {
		if (!pendingFiles) return;
		showConfirm = false;

		folderPath = pendingFolderName;
		translating = true;
		xmlFiles = [];

		const candidates = Array.from(pendingFiles).filter((f) =>
			f.name.toLowerCase().endsWith('.xml')
		);

		const results: XmlFile[] = [];
		for (const file of candidates) {
			const content = await file.text();
			if (!isValidXml(content)) continue;
			const lines = content.split('\n').length;
			results.push({ name: file.name, lines, status: 'pending' });
		}

		results.sort((a, b) => a.name.localeCompare(b.name));
		xmlFiles = results;
		translating = false;
		pendingFiles = null;
	}
</script>

<!-- Confirmation dialog -->
{#if showConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div class="w-full max-w-md mx-4 bg-[#0d2137] border border-blue-800/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
			<!-- Dialog header -->
			<div class="px-6 pt-6 pb-4 border-b border-blue-900/40">
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0 mt-0.5">
						<svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
						</svg>
					</div>
					<div>
						<h2 id="confirm-title" class="text-base font-semibold text-white">Translate XML files?</h2>
						<p class="text-sm text-slate-400 mt-0.5">The following folder will be scanned and all valid XML files will be translated.</p>
					</div>
				</div>
			</div>

			<!-- Folder details -->
			<div class="px-6 py-4 space-y-3">
				<div class="bg-[#07111f] border border-blue-900/50 rounded-lg px-4 py-3">
					<p class="text-xs text-slate-500 mb-1">Folder path</p>
					<p class="text-sm text-slate-200 font-mono break-all">{pendingFolderName}</p>
				</div>
				<div class="flex items-center gap-2 text-sm text-slate-400">
					<svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					{#if pendingFileCount === 0}
						No XML files detected
					{:else}
						<span><span class="text-blue-300 font-medium">{pendingFileCount}</span> XML {pendingFileCount === 1 ? 'file' : 'files'} detected</span>
					{/if}
				</div>
			</div>

			<!-- Actions -->
			<div class="px-6 pb-6 flex gap-3 justify-end">
				<button
					onclick={cancelTranslate}
					class="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={confirmTranslate}
					disabled={pendingFileCount === 0}
					class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
					</svg>
					Translate
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-[#07111f] text-slate-100 font-sans">
	<!-- Header -->
	<header class="border-b border-blue-900/50 bg-[#0a1929] px-8 py-5">
		<div class="max-w-4xl mx-auto flex items-center gap-3">
			<div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
				<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
				</svg>
			</div>
			<div>
				<h1 class="text-lg font-semibold text-white">XML String Translator</h1>
				<p class="text-xs text-slate-400">Powered by Claude AI</p>
			</div>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-8 py-8 space-y-6">
		<!-- Controls -->
		<div class="bg-[#0d2137] border border-blue-900/50 rounded-xl p-6 space-y-5">
			<h2 class="text-sm font-semibold text-blue-300 uppercase tracking-wider">Configuration</h2>

			<!-- Folder selector -->
			<div class="space-y-2">
				<label for="folder-input" class="block text-sm text-slate-300">Source Folder</label>
				<div class="flex gap-3">
					<div class="flex-1 flex items-center gap-3 bg-[#07111f] border border-blue-900/60 rounded-lg px-4 py-2.5 min-w-0">
						<svg class="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
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
							onchange={handleFolderSelect}
							webkitdirectory
							multiple
						/>
						<span class="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-700 border border-blue-600 text-blue-100 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
							Browse
						</span>
					</label>
				</div>
			</div>
		</div>

		<!-- File list -->
		<div class="bg-[#0d2137] border border-blue-900/50 rounded-xl overflow-hidden">
			<!-- List header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-blue-900/40">
				<div class="flex items-center gap-3">
					<h2 class="text-sm font-semibold text-blue-300 uppercase tracking-wider">XML Files</h2>
					<span class="text-xs bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">{totalCount} files</span>
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
			{#if translating}
				<div class="flex flex-col items-center justify-center py-16 text-slate-400">
					<svg class="w-8 h-8 mb-3 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<p class="text-sm">Translating...</p>
				</div>
			{:else if xmlFiles.length === 0}
				<div class="flex flex-col items-center justify-center py-16 text-slate-500">
					<svg class="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
					</svg>
					<p class="text-sm">{folderPath ? 'No valid XML files found in this folder' : 'Select a folder to see XML files'}</p>
				</div>
			{:else}
				<ul class="divide-y divide-blue-900/30">
					{#each xmlFiles as file (file.name)}
						<li class="flex items-center gap-4 px-6 py-4 hover:bg-blue-900/10 transition-colors">
							<div class="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
								<svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-slate-100 truncate">{file.name}</p>
								<p class="text-xs text-slate-500 mt-0.5">{file.lines.toLocaleString()} lines</p>
							</div>
							<span class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0 {statusConfig[file.status].class}">
								{statusConfig[file.status].label}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</main>
</div>
