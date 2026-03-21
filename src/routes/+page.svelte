<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import JSZip from 'jszip';

	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import FolderSelector from '$lib/components/FolderSelector.svelte';
	import FileList from '$lib/components/FileList.svelte';

	import { isValidXml, extractCdata, substituteCdata } from '$lib/utils/xml';
	import type { XmlFile, TranslationItem } from '$lib/types';

	const BATCH_SIZE = 100;

	// ── State ──────────────────────────────────────────────────────────────────
	let folderPath = $state('');
	let xmlFiles = $state<XmlFile[]>([]);
	let translating = $state(false);

	const fileMap = new SvelteMap<string, File>();
	const translatedContents = new SvelteMap<string, string>();

	// Confirmation dialog
	let pendingFiles = $state<FileList | null>(null);
	let pendingFolderName = $state('');
	let pendingFileCount = $state(0);
	let showConfirm = $state(false);

	// ── Derived ────────────────────────────────────────────────────────────────
	const doneCount = $derived(xmlFiles.filter((f) => f.status === 'done').length);
	const totalCount = $derived(xmlFiles.length);
	const overallProgress = $derived(
		totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
	);
	const allDone = $derived(
		totalCount > 0 &&
			!translating &&
			xmlFiles.every((f) => f.status === 'done' || f.status === 'error')
	);
	const hasSuccessful = $derived(xmlFiles.some((f) => f.status === 'done'));
	const zipFolderName = $derived(
		folderPath.split(/[/\\]/).filter(Boolean).at(-1) ?? 'translated'
	);

	// ── Helpers ────────────────────────────────────────────────────────────────
	function updateFile(name: string, patch: Partial<XmlFile>) {
		xmlFiles = xmlFiles.map((f) => (f.name === name ? { ...f, ...patch } : f));
	}

	// ── Event handlers ─────────────────────────────────────────────────────────
	function handleFolderSelect(files: FileList, folderName: string, xmlCount: number) {
		pendingFiles = files;
		pendingFolderName = folderName;
		pendingFileCount = xmlCount;
		showConfirm = true;
	}

	function handleCancel() {
		showConfirm = false;
		pendingFiles = null;
		pendingFolderName = '';
		pendingFileCount = 0;
	}

	async function handleConfirm() {
		if (!pendingFiles) return;
		showConfirm = false;

		folderPath = pendingFolderName;
		translating = true;
		translatedContents.clear();
		fileMap.clear();
		xmlFiles = [];

		// Scan and validate XML files
		const scanned: XmlFile[] = [];
		for (const file of Array.from(pendingFiles).filter((f) =>
			f.name.toLowerCase().endsWith('.xml')
		)) {
			const content = await file.text();
			if (!isValidXml(content)) continue;
			const items = extractCdata(content);
			scanned.push({
				name: file.name,
				lines: content.split('\n').length,
				totalStrings: items.length,
				translatedStrings: 0,
				status: 'pending',
			});
			fileMap.set(file.name, file);
		}
		scanned.sort((a, b) => a.name.localeCompare(b.name));
		xmlFiles = scanned;
		pendingFiles = null;

		// Translate each file sequentially
		for (const entry of xmlFiles) {
			const file = fileMap.get(entry.name);
			if (!file) continue;

			updateFile(entry.name, { status: 'in-progress', translatedStrings: 0 });

			try {
				const xml = await file.text();
				const allItems = extractCdata(xml);

				if (allItems.length === 0) {
					translatedContents.set(entry.name, xml);
					updateFile(entry.name, { status: 'done' });
					continue;
				}

				const allTranslations: TranslationItem[] = [];

				for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
					const batch = allItems.slice(i, i + BATCH_SIZE);
					const res = await fetch('/api/translate', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ items: batch, filename: entry.name }),
					});

					if (!res.ok) {
						const body = await res.json().catch(() => ({ message: res.statusText }));
						throw new Error(body?.message ?? res.statusText);
					}

					const { items: translated } = await res.json();
					allTranslations.push(...translated);
					updateFile(entry.name, { translatedStrings: allTranslations.length });
				}

				translatedContents.set(entry.name, substituteCdata(xml, allTranslations));
				updateFile(entry.name, { status: 'done', translatedStrings: allItems.length });
			} catch (e) {
				const msg = (e as Error).message;
				console.error(`[${entry.name}]`, msg);
				updateFile(entry.name, { status: 'error', errorMsg: msg });
			}
		}

		translating = false;
	}

	async function handleDownload() {
		const zip = new JSZip();
		for (const [name, content] of translatedContents) {
			zip.file(name, content);
		}
		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${zipFolderName}.zip`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<ConfirmDialog
	show={showConfirm}
	folderName={pendingFolderName}
	fileCount={pendingFileCount}
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
			<FolderSelector {folderPath} onSelect={handleFolderSelect} />
		</div>

		<!-- File list -->
		<FileList
			files={xmlFiles}
			{folderPath}
			{doneCount}
			{totalCount}
			{overallProgress}
			{allDone}
			{hasSuccessful}
			{zipFolderName}
			onDownload={handleDownload}
		/>
	</main>
</div>
